# Báo Cáo Dự Án NoHope

NoHope là một ứng dụng quản lý chứng chỉ và bằng cấp dựa trên blockchain. Ý tưởng chính của hệ thống là đưa quá trình cấp, lưu trữ, tra cứu, xác minh và thu hồi chứng chỉ lên một kiến trúc có thể kiểm chứng được, hạn chế sửa đổi tùy tiện và dễ truy vết lịch sử hơn so với cách lưu trữ thuần túy trong cơ sở dữ liệu truyền thống.

Dự án được xây theo mô hình kết hợp giữa web application, blockchain và database:
- Phần web dùng Next.js 16, React 19, TypeScript, Tailwind, Wagmi, RainbowKit và Ethers.js.
- Phần blockchain nằm trong workspace Hardhat riêng.
- Phần dữ liệu vận hành và lịch sử được lưu thêm vào MongoDB để phục vụ truy vấn nhanh, hiển thị dashboard và audit.

## 1. Mục tiêu của hệ thống

Ứng dụng được thiết kế để giải quyết bài toán quản lý chứng chỉ theo ba hướng chính:

- Tổ chức phát hành có thể tạo chứng chỉ cho sinh viên một cách có kiểm soát.
- Sinh viên có thể xem lại chứng chỉ của mình trong một kho cá nhân rõ ràng.
- Bên thứ ba như nhà tuyển dụng, người kiểm tra hoặc công khai có thể xác minh tính hợp lệ của chứng chỉ bằng hash.

Ngoài ra, admin có thể quản lý danh sách các issuer được tin cậy, qua đó đảm bảo rằng chỉ các đơn vị hợp lệ mới được phép phát hành và thu hồi chứng chỉ.

## 2. Kiến trúc tổng thể

### 2.1. Lớp giao diện
Phần giao diện nằm trong [nohope/app](nohope/app) và sử dụng cấu trúc App Router của Next.js. Dự án chia route khá rõ ràng:

- Trang công khai ở `/`
- Luồng đăng nhập ở `[auth]`
- Khu vực bảo vệ ở `[security]`
- Trang chi tiết chứng chỉ công khai ở `/certificates/[certHash]`

Các component giao diện được đặt trong [nohope/components](nohope/components). Ứng dụng sử dụng khá nhiều thành phần dạng card, table, dialog, sidebar, badge, button, input... theo phong cách shadcn UI. Nhìn chung phần giao diện đã được đầu tư, không chỉ dừng ở mức demo tối giản.

### 2.2. Lớp xác thực
Ứng dụng sử dụng ví blockchain để xác thực người dùng. Luồng hiện tại là:

1. Người dùng kết nối ví.
2. Client yêu cầu người dùng ký một thông điệp xác thực.
3. Server nhận chữ ký tại [nohope/app/api/auth/verify/route.ts](nohope/app/api/auth/verify/route.ts).
4. Server kiểm tra chữ ký bằng địa chỉ ví đã khai báo.
5. Nếu hợp lệ, hệ thống tạo cookie `access_token`.
6. Người dùng được chuyển tới màn hình tương ứng với vai trò của mình.

Đây là cách xác thực đúng với mô hình Web3, vì quyền truy cập gắn với quyền sở hữu ví. Tuy nhiên, ở mức production thì vẫn cần tăng cường thêm cơ chế chống replay, quản lý phiên và kiểm soát bảo mật tốt hơn.

### 2.3. Lớp blockchain
Smart contract chính nằm ở [hardhat/contracts/CertificateRegistry.sol](hardhat/contracts/CertificateRegistry.sol).

Contract này lưu các dữ liệu cốt lõi của hệ thống:

- địa chỉ admin của hệ thống
- danh sách issuer được phép hoạt động
- dữ liệu chứng chỉ theo hash
- danh sách chứng chỉ theo từng sinh viên

Các hành động on-chain chính gồm:

- thêm issuer
- vô hiệu hóa issuer
- cấp chứng chỉ
- thu hồi chứng chỉ
- xác minh chứng chỉ
- chuyển quyền admin

Ứng dụng phía web tương tác với contract thông qua [nohope/lib/contract.ts](nohope/lib/contract.ts). Lớp này đóng vai trò là wrapper cho các thao tác đọc/ghi trên blockchain, đồng thời chuẩn hóa cách tính hash chứng chỉ và chuyển đổi dữ liệu giữa Solidity và TypeScript.

### 2.4. Lớp cơ sở dữ liệu
MongoDB được dùng như lớp dữ liệu hỗ trợ, không thay thế blockchain. Các model chính nằm ở [nohope/model](nohope/model):

- [certificate.model.ts](nohope/model/certificate.model.ts)
- [transaction-history.model.ts](nohope/model/transaction-history.model.ts)
- [issuers.model.ts](nohope/model/issuers.model.ts)
- [users.model.ts](nohope/model/users.model.ts)

Vai trò của database là:

- lưu metadata chứng chỉ để truy vấn nhanh
- lưu lịch sử giao dịch để phục vụ audit và dashboard
- lưu danh sách issuer dưới góc nhìn ứng dụng
- lưu thông tin người dùng đã xác thực

Nói ngắn gọn, blockchain giữ tính đúng đắn và bất biến, còn MongoDB giữ trải nghiệm truy vấn và báo cáo cho người dùng.

## 3. Luồng chức năng chi tiết

### 3.1. Trang chủ và tra cứu công khai
Trang chủ tại [nohope/app/page.tsx](nohope/app/page.tsx) là mặt tiền của hệ thống. Trang này vừa giới thiệu ứng dụng, vừa cho phép người dùng nhập hash chứng chỉ để đi tới trang tra cứu chi tiết.

Khi người dùng nhập một hash hợp lệ, ứng dụng chuyển sang trang [nohope/app/certificates/[certHash]/page.tsx](nohope/app/certificates/%5BcertHash%5D/page.tsx). Trang này sẽ:

- gọi API để lấy dữ liệu chứng chỉ
- xác minh chứng chỉ trên blockchain
- hiển thị thông tin học viên, tổ chức cấp, loại bằng, GPA, ngày tốt nghiệp, txHash, IPFS CID và trạng thái thu hồi
- nếu chứng chỉ đã bị thu hồi, hiển thị rõ người thu hồi và thời điểm thu hồi

Đây là một chức năng quan trọng vì nó cho phép kiểm tra công khai mà không cần tài khoản hay đăng nhập.

### 3.2. Luồng sinh viên
Trang sinh viên nằm ở [nohope/app/(security)/(student)/student/certificates/page.tsx](nohope/app/(security)/(student)/student/certificates/page.tsx).

Trang này thể hiện kho chứng chỉ cá nhân của sinh viên theo hướng dễ đọc hơn nhiều so với dữ liệu thô trên blockchain. Các thông tin chính gồm:

- tổng số chứng chỉ
- số chứng chỉ còn hiệu lực
- số chứng chỉ đã thu hồi
- danh sách chi tiết từng chứng chỉ của ví đang kết nối

Mỗi chứng chỉ được hiển thị dưới dạng card và có thể xem rõ các trường như:

- tên sinh viên
- loại bằng
- hash chứng chỉ
- chuyên ngành
- năm tốt nghiệp
- ngày tốt nghiệp
- GPA
- trạng thái hợp lệ hoặc đã thu hồi

Về mặt trải nghiệm người dùng, đây là phần giúp blockchain trở nên dễ hiểu và dễ dùng hơn đối với sinh viên.

### 3.3. Luồng issuer
Các trang issuer nằm trong [nohope/app/(security)/(issuer)/issuer](nohope/app/(security)/(issuer)/issuer).

Issuer có ba màn hình chính:

- [dashboard/page.tsx](nohope/app/(security)/(issuer)/issuer/dashboard/page.tsx): trang tổng quan thống kê
- [issue/page.tsx](nohope/app/(security)/(issuer)/issuer/issue/page.tsx): trang phát hành chứng chỉ
- [certificates/page.tsx](nohope/app/(security)/(issuer)/issuer/certificates/page.tsx): trang lịch sử, tìm kiếm và thu hồi

#### Dashboard issuer
Trang dashboard issuer cho thấy nhanh:

- tổng số chứng chỉ đã phát hành
- số chứng chỉ còn hiệu lực
- số chứng chỉ đã bị thu hồi

Mục tiêu của màn này là giúp issuer nắm được tình trạng hoạt động của mình trong một cái nhìn ngắn.

#### Màn phát hành
Phần phát hành thực tế nằm ở [nohope/components/issue-certificates.tsx](nohope/components/issue-certificates.tsx).

Quy trình phát hành ở đây gồm:

1. Nhập dữ liệu sinh viên.
2. Nhập loại bằng, chuyên ngành, GPA và ngày tốt nghiệp.
3. Tạo payload chứng chỉ.
4. Tính certHash off-chain.
5. Ký thông điệp bằng ví issuer.
6. Gửi request lên API phát hành.
7. Ghi lại giao dịch và cập nhật dữ liệu trong database.

Đây là phần nối giữa nghiệp vụ web và blockchain, vì dữ liệu chứng chỉ không chỉ hiển thị trên giao diện mà còn được ghi lên chain.

#### Lịch sử và thu hồi
Trang [nohope/app/(security)/(issuer)/issuer/certificates/page.tsx](nohope/app/(security)/(issuer)/issuer/certificates/page.tsx) kết hợp component [nohope/components/certificate-history.tsx](nohope/components/certificate-history.tsx) để cung cấp:

- danh sách chứng chỉ đã phát hành
- tìm kiếm theo tên, loại bằng, hash hoặc địa chỉ
- phân trang
- nút thu hồi chứng chỉ

Khi thu hồi, hệ thống lại yêu cầu ký thông điệp, gọi API thu hồi, cập nhật trạng thái on-chain và lưu lịch sử trong MongoDB.

### 3.4. Luồng admin
Khu vực admin nằm trong [nohope/app/(security)/(admin)/admin](nohope/app/(security)/(admin)/admin).

#### Dashboard admin
Trang [nohope/app/(security)/(admin)/admin/dashboard/page.tsx](nohope/app/(security)/(admin)/admin/dashboard/page.tsx) thể hiện tình trạng hoạt động của hệ thống bằng các giao dịch đã ghi nhận. Trang này hiển thị:

- tổng số người dùng
- số lượng giao dịch
- tổng gas hoặc chi phí giao dịch theo dữ liệu hiện có
- bảng hoạt động hệ thống

#### Quản lý issuer
Trang [nohope/app/(security)/(admin)/admin/issuers/page.tsx](nohope/app/(security)/(admin)/admin/issuers/page.tsx) cho phép admin xem danh sách issuer và khóa issuer khi cần.

Việc thêm issuer được thực hiện bằng [nohope/components/add-issuer-dialog.tsx](nohope/components/add-issuer-dialog.tsx). Tại đây admin nhập:

- địa chỉ ví của đơn vị phát hành
- tên tổ chức

Sau đó hệ thống ký request, gọi API, ghi giao dịch lên blockchain và cập nhật dữ liệu MongoDB để đồng bộ trạng thái.

## 4. Hệ thống API

API của dự án khá đầy đủ cho một ứng dụng chứng chỉ blockchain.

### Nhóm xác thực
- [nohope/app/api/auth/verify/route.ts](nohope/app/api/auth/verify/route.ts): xác thực ví, nhận chữ ký và tạo phiên đăng nhập
- [nohope/app/api/auth/logout/route.ts](nohope/app/api/auth/logout/route.ts): xóa phiên đăng nhập

### Nhóm chứng chỉ
- [nohope/app/api/eth/certificates/issue/route.ts](nohope/app/api/eth/certificates/issue/route.ts): phát hành chứng chỉ
- [nohope/app/api/eth/certificates/revoke/route.ts](nohope/app/api/eth/certificates/revoke/route.ts): thu hồi chứng chỉ
- [nohope/app/api/eth/certificates/history/route.ts](nohope/app/api/eth/certificates/history/route.ts): lấy lịch sử theo issuer
- [nohope/app/api/eth/certificates/search/route.ts](nohope/app/api/eth/certificates/search/route.ts): tìm kiếm chứng chỉ
- [nohope/app/api/eth/certificates/stats/route.ts](nohope/app/api/eth/certificates/stats/route.ts): thống kê chứng chỉ của issuer
- [nohope/app/api/eth/certificates/student/route.ts](nohope/app/api/eth/certificates/student/route.ts): lấy chứng chỉ theo sinh viên
- [nohope/app/api/eth/certificates/[certHash]/route.ts](nohope/app/api/eth/certificates/%5BcertHash%5D/route.ts): tra cứu và xác minh chứng chỉ công khai

### Nhóm issuer
- [nohope/app/api/eth/issuers/add/route.ts](nohope/app/api/eth/issuers/add/route.ts): thêm issuer
- [nohope/app/api/eth/issuers/remove/route.ts](nohope/app/api/eth/issuers/remove/route.ts): vô hiệu hóa issuer
- [nohope/app/api/eth/issuers/all/route.ts](nohope/app/api/eth/issuers/all/route.ts): lấy toàn bộ issuer

### Nhóm giao dịch và tiện ích
- [nohope/app/api/trans/route.ts](nohope/app/api/trans/route.ts): lấy toàn bộ giao dịch
- [nohope/app/api/trans/[address]/route.ts](nohope/app/api/trans/%5Baddress%5D/route.ts): lấy giao dịch theo địa chỉ
- [nohope/app/api/eth/price/route.ts](nohope/app/api/eth/price/route.ts): lấy giá ETH từ nguồn ngoài

Nhìn tổng thể, API không chỉ là lớp trung gian mà còn là nơi gom logic xác thực, kiểm tra quyền, đồng bộ blockchain và ghi lịch sử.

## 5. Smart contract và dữ liệu on-chain

Smart contract [hardhat/contracts/CertificateRegistry.sol](hardhat/contracts/CertificateRegistry.sol) là lõi của toàn bộ hệ thống.

### Dữ liệu lưu on-chain
Contract lưu:

- địa chỉ admin
- thông tin issuer theo địa chỉ ví
- thông tin chứng chỉ theo certHash
- danh sách certHash của từng sinh viên

### Quy tắc nghiệp vụ
- chỉ admin mới có quyền thêm hoặc xóa issuer
- chỉ issuer đang hoạt động mới được cấp hoặc thu hồi chứng chỉ
- chỉ issuer gốc mới có thể thu hồi chứng chỉ mà mình đã phát hành
- một certHash chỉ được cấp duy nhất một lần
- chứng chỉ đã thu hồi không bị xóa mà chỉ đổi trạng thái

### Các hàm quan trọng
- `addIssuer`
- `removeIssuer`
- `issueCertificate`
- `revokeCertificate`
- `verifyCertificate`
- `getStudentCertificates`
- `transferAdmin`

Thiết kế này hợp lý với bài toán chứng chỉ vì dữ liệu cần có lịch sử và không nên bị xóa sạch khi có thay đổi trạng thái.

## 6. Lớp dịch vụ và xử lý nghiệp vụ

Phía ứng dụng có các service để gom logic thay vì gọi trực tiếp mọi thứ từ component.

- [nohope/services/user.service.ts](nohope/services/user.service.ts): tạo user, tìm chứng chỉ, đếm người dùng
- [nohope/services/admin.service.ts](nohope/services/admin.service.ts): thêm, lấy, vô hiệu hóa issuer
- [nohope/services/issuer.service.ts](nohope/services/issuer.service.ts): phát hành, thu hồi, tìm kiếm, thống kê chứng chỉ
- [nohope/services/transaction.service.ts](nohope/services/transaction.service.ts): lưu và truy vấn lịch sử giao dịch

Trong số này, `IssuerService` là lớp quan trọng nhất vì nó xử lý chuỗi nghiệp vụ phát hành và thu hồi:

1. Kết nối MongoDB.
2. Kiểm tra issuer có hoạt động trên blockchain hay không.
3. Chuẩn hóa dữ liệu và tính certHash off-chain.
4. Tạo ipfsCID theo payload hiện tại.
5. Gửi giao dịch lên smart contract.
6. Ghi transaction history vào database.
7. Cập nhật hoặc tạo mới bản ghi certificate trong MongoDB.

Điểm này cho thấy dự án không chỉ là giao diện mà đã có lớp nghiệp vụ thực sự.

## 7. Điểm mạnh của dự án

### Về sản phẩm
- Có phân vai rõ ràng giữa admin, issuer và student.
- Có luồng nghiệp vụ đầy đủ cho phát hành, tra cứu, xác minh và thu hồi.
- Có trang public verify không cần đăng nhập.
- Có dashboard và lịch sử hoạt động cho từng vai trò.

### Về kỹ thuật
- Có smart contract thật thay vì chỉ giả lập.
- Có đồng bộ giữa on-chain state và MongoDB.
- Có wrapper contract rõ ràng ở phía app.
- Có API riêng cho từng nghiệp vụ.

### Về giao diện
- Giao diện đã được đầu tư khá tốt.
- Bố cục dashboard, card, sidebar và bảng dữ liệu rõ ràng.
- Dự án có tính hoàn chỉnh hơn một demo thông thường.

## 8. Những điểm cần cải thiện

### Bảo mật
- Luồng ký thông điệp chưa có nonce store hoặc cơ chế chống replay mạnh.
- Private key phía server vẫn là điểm nhạy cảm lớn.
- Cookie auth đang để `secure: false`, chưa phù hợp cho production qua HTTPS.

### Đồng bộ dữ liệu
- Blockchain là nguồn chuẩn, nhưng MongoDB vẫn có thể lệch nếu một bước ghi thất bại.
- Cần cơ chế retry, logging và kiểm tra lỗi tốt hơn khi ghi song song lên chain và database.
- CID IPFS hiện mới được sinh giả lập, chưa phải quy trình upload thật.

### Mức độ hoàn thiện sản phẩm
- Một số trang như settings và profile vẫn thiên về demo hơn là tính năng nghiệp vụ hoàn chỉnh.
- Audit, monitoring và error handling còn có thể làm rõ hơn.
- Có vài nhãn và giá trị mặc định có thể chuẩn hóa lại để chuyên nghiệp hơn.

## 9. Nhận xét cuối cùng

NoHope là một MVP khá tốt cho bài toán quản lý chứng chỉ bằng blockchain. Ứng dụng đã cho thấy đầy đủ các thành phần quan trọng của một hệ thống thực tế: xác thực bằng ví, phân quyền, phát hành chứng chỉ, thu hồi, tra cứu công khai, lưu lịch sử giao dịch và đồng bộ với database.

Nếu xét ở mức đồ án hoặc demo kỹ thuật, đây là một dự án có nền tảng tốt và có thể trình bày rõ ràng. Nếu xét ở mức production, phần cần đầu tư tiếp theo sẽ là bảo mật, chống replay, quản lý key, đồng bộ dữ liệu và xây dựng luồng IPFS thật thay vì mô phỏng.
