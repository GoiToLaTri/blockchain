# 🎓 Hệ thống Quản lý Chứng chỉ Blockchain

Nền tảng quản lý và xác thực chứng chỉ phi tập trung sử dụng công nghệ blockchain, giúp đảm bảo tính minh bạch, bảo mật và chống giả mạo.

---

## 🚀 Tổng quan

Hệ thống cho phép các tổ chức giáo dục phát hành, quản lý và xác thực chứng chỉ số:

* Hash chứng chỉ được lưu trên **blockchain** (không thể chỉnh sửa)
* Dữ liệu chi tiết được lưu trên **IPFS** (đảm bảo riêng tư)

### Vai trò trong hệ thống

* **Admin**: Quản lý hệ thống, cấp quyền cho Issuer
* **Issuer**: Phát hành và thu hồi chứng chỉ
* **Student**: Xem và sử dụng chứng chỉ

---

## ✨ Tính năng

* 🔗 Lưu trữ chứng chỉ trên blockchain
* 🔐 Bảo mật dữ liệu với IPFS
* 👥 Phân quyền theo vai trò
* ✅ Xác thực chứng chỉ công khai (không cần đăng nhập)
* 🚫 Hỗ trợ thu hồi chứng chỉ
* 📜 Theo dõi lịch sử giao dịch
* 🌐 Hỗ trợ nhiều mạng (Ethereum, Sepolia,...)
* 👛 Kết nối ví Web3 (MetaMask, RainbowKit)

---

## 🏗️ Công nghệ sử dụng

### Frontend

* Next.js + React + TypeScript
* Tailwind CSS
* RainbowKit + wagmi

### Backend

* Next.js API Routes
* Node.js

### Smart Contract

* Solidity
* Hardhat
* ethers.js

### Database & Storage

* MongoDB (lưu user, lịch sử)
* IPFS (lưu metadata chứng chỉ)

### Hạ tầng

* Docker & Docker Compose
* Nginx

---

## ⚙️ Cách hoạt động

1. Issuer tạo chứng chỉ → sinh hash
2. Hash được ghi lên blockchain
3. Metadata lưu trên IPFS
4. Khi xác thực:

   * Nhập mã/hash chứng chỉ
   * So sánh với blockchain
   * Nếu hợp lệ → hiển thị thông tin

---

## 🔐 Bảo mật

* Không lưu dữ liệu nhạy cảm on-chain
* Sử dụng Keccak256 để hash
* IPFS đảm bảo dữ liệu không thể sửa
* Xác thực bằng chữ ký ví Web3
* Không thể xóa chứng chỉ (chỉ revoke)

---

## 🚀 Chạy dự án

```bash
# Cài dependencies
cd nohope
npm install

cd ../hardhat
npm install

# Chạy app
cd ../nohope
npm run dev
```

Truy cập: http://localhost:3000

### Docker

```bash
docker compose build 
docker compose up -d
```

Truy cập: http://localhost:8080

---

## 📱 Hỗ trợ

* Desktop (khuyến nghị)
* Mobile (cơ bản)

---

## 👥 Đóng góp

Dự án được phát triển bởi nhóm

---

## 📄 License

MIT License

---
