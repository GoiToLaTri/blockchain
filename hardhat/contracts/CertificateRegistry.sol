// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============================================================
//  CertificateRegistry – Hệ thống quản lý văn bằng / chứng chỉ
//  trên blockchain (Solidity 0.8.20)
//
//  Kiến trúc phân quyền 3 tầng:
//    Admin  →  Issuer (trường ĐH / trung tâm ĐT)  →  Student
// ============================================================

contract CertificateRegistry {

    // ──────────────────────────────────────────────────────────
    //  SECTION 1 – STRUCTS (Cấu trúc dữ liệu)
    // ──────────────────────────────────────────────────────────

    /**
     * @dev Thông tin của một Issuer (tổ chức cấp bằng).
     *      Được lưu trong mapping issuers[address].
     */
    struct Issuer {
        string  name;        // Tên tổ chức (VD: "Đại học Bách Khoa")
        bool    isActive;    // true = còn quyền cấp bằng
        uint256 addedAt;     // Timestamp lúc được Admin thêm vào
    }

    /**
     * @dev Thông tin của một Certificate (văn bằng / chứng chỉ).
     *
     *  certHash  – keccak256 của toàn bộ metadata gốc (tên sinh viên,
     *              loại bằng, ngày cấp, GPA …). Đây là "dấu vân tay"
     *              dùng để xác thực tính toàn vẹn.
     *
     *  ipfsCID   – Content-ID trên IPFS chứa metadata JSON đầy đủ.
     *              Lưu CID (string) thay vì raw data để tiết kiệm gas.
     *
     *  isRevoked – false = còn hiệu lực, true = đã bị thu hồi.
     */
    struct Certificate {
        bytes32 certHash;     // Hash xác thực tính toàn vẹn
        string  ipfsCID;      // IPFS Content ID (metadata)
        address issuer;       // Địa chỉ ví của tổ chức cấp bằng
        address student;      // Địa chỉ ví của sinh viên
        uint256 issuedAt;     // Timestamp cấp bằng
        uint256 revokedAt;    // Timestamp thu hồi (0 nếu chưa thu hồi)
        bool    isRevoked;    // Cờ trạng thái thu hồi
    }

    // ──────────────────────────────────────────────────────────
    //  SECTION 2 – STATE VARIABLES (Biến trạng thái)
    // ──────────────────────────────────────────────────────────

    /// @notice Địa chỉ Admin tối cao (Bộ Giáo dục / cơ quan quản lý).
    address public admin;

    /**
     * @dev Danh sách Issuer được tin tưởng.
     *      Key: địa chỉ ví của tổ chức.
     */
    mapping(address => Issuer) public issuers;

    /**
     * @dev Kho lưu trữ tất cả văn bằng.
     *      Key: certHash (bytes32) – đảm bảo mỗi hash là duy nhất.
     */
    mapping(bytes32 => Certificate) public certificates;

    /**
     * @dev Danh sách certHash thuộc về mỗi sinh viên.
     *      Giúp truy vấn "tất cả bằng của sinh viên X".
     */
    mapping(address => bytes32[]) public studentCertificates;

    // ──────────────────────────────────────────────────────────
    //  SECTION 3 – EVENTS (Sự kiện – dành cho off-chain indexing)
    // ──────────────────────────────────────────────────────────

    /// @notice Phát ra khi Admin thêm một Issuer mới.
    event IssuerAdded(address indexed issuerAddr, string name, uint256 timestamp);

    /// @notice Phát ra khi Admin vô hiệu hóa một Issuer.
    event IssuerRemoved(address indexed issuerAddr, uint256 timestamp);

    /// @notice Phát ra khi một văn bằng được cấp thành công.
    event CertificateIssued(
        bytes32 indexed certHash,
        address indexed issuer,
        address indexed student,
        string  ipfsCID,
        uint256 timestamp
    );

    /// @notice Phát ra khi một văn bằng bị thu hồi.
    event CertificateRevoked(
        bytes32 indexed certHash,
        address indexed revokedBy,
        uint256 timestamp
    );

    // ──────────────────────────────────────────────────────────
    //  SECTION 4 – MODIFIERS (Bộ điều kiện tiên quyết)
    // ──────────────────────────────────────────────────────────

    /// @dev Chỉ Admin mới được gọi hàm được bảo vệ bởi modifier này.
    modifier onlyAdmin() {
        require(msg.sender == admin, "CertReg: caller is not admin");
        _;
    }

    /// @dev Chỉ Issuer đang hoạt động mới được cấp / thu hồi bằng.
    modifier onlyActiveIssuer() {
        require(
            issuers[msg.sender].isActive,
            "CertReg: caller is not an active issuer"
        );
        _;
    }

    // ──────────────────────────────────────────────────────────
    //  SECTION 5 – CONSTRUCTOR
    // ──────────────────────────────────────────────────────────

    /**
     * @notice Deploy contract, gán người deploy làm Admin.
     * @dev    Admin nên là địa chỉ ví multi-sig (VD: Gnosis Safe)
     *         để tránh single-point-of-failure.
     */
    constructor() {
        admin = msg.sender;
    }

    // ──────────────────────────────────────────────────────────
    //  SECTION 6 – QUẢN LÝ ISSUER (Admin functions)
    // ──────────────────────────────────────────────────────────

    /**
     * @notice Thêm một tổ chức vào danh sách Trusted Issuers.
     * @dev    Chỉ Admin. Nếu địa chỉ đã tồn tại sẽ cập nhật lại.
     *
     * @param _issuerAddr  Địa chỉ ví của tổ chức cấp bằng.
     * @param _name        Tên tổ chức (lưu on-chain để tiện tra cứu).
     */
    function addIssuer(address _issuerAddr, string calldata _name)
        external
        onlyAdmin
    {
        require(_issuerAddr != address(0), "CertReg: zero address");
        require(bytes(_name).length > 0,   "CertReg: empty name");

        issuers[_issuerAddr] = Issuer({
            name:     _name,
            isActive: true,
            addedAt:  block.timestamp
        });

        emit IssuerAdded(_issuerAddr, _name, block.timestamp);
    }

    /**
     * @notice Vô hiệu hóa quyền cấp bằng của một tổ chức.
     * @dev    Không xóa khỏi mapping để lịch sử vẫn còn tra cứu được.
     *         Chỉ đặt isActive = false.
     *
     * @param _issuerAddr  Địa chỉ ví cần vô hiệu hóa.
     */
    function removeIssuer(address _issuerAddr)
        external
        onlyAdmin
    {
        require(issuers[_issuerAddr].isActive, "CertReg: issuer not active");

        issuers[_issuerAddr].isActive = false;

        emit IssuerRemoved(_issuerAddr, block.timestamp);
    }

    /**
     * @notice Kiểm tra một địa chỉ có phải Issuer hợp lệ không.
     * @param  _issuerAddr  Địa chỉ cần kiểm tra.
     * @return bool         true nếu đang hoạt động.
     */
    function verifyIssuer(address _issuerAddr)
        external
        view
        returns (bool)
    {
        return issuers[_issuerAddr].isActive;
    }

    // ──────────────────────────────────────────────────────────
    //  SECTION 7 – VÒNG ĐỜI VĂN BẰNG (Certificate lifecycle)
    // ──────────────────────────────────────────────────────────

    /**
     * @notice Cấp một văn bằng mới cho sinh viên.
     *
     * @dev    Quy trình off-chain trước khi gọi hàm này:
     *           1. Tạo metadata JSON: { studentName, degree, gpa, ... }
     *           2. Upload JSON lên IPFS → lấy CID
     *           3. Hash toàn bộ metadata: keccak256(abi.encode(...))
     *           4. Gọi issueCertificate(_student, _certHash, _ipfsCID)
     *
     *         certHash là kết quả của bước 3 – phải tính off-chain
     *         để tránh lộ dữ liệu nhạy cảm lên calldata công khai.
     *
     * @param  _student    Địa chỉ ví của sinh viên nhận bằng.
     * @param  _certHash   Hash xác thực (bytes32) tính từ metadata gốc.
     * @param  _ipfsCID    CID trên IPFS chứa metadata JSON.
     */
    function issueCertificate(
        address        _student,
        bytes32        _certHash,
        string calldata _ipfsCID
    )
        external
        onlyActiveIssuer
    {
        require(_student  != address(0),       "CertReg: zero student address");
        require(_certHash != bytes32(0),        "CertReg: empty cert hash");
        require(bytes(_ipfsCID).length > 0,    "CertReg: empty IPFS CID");

        // Mỗi certHash phải là duy nhất – ngăn cấp trùng
        require(
            certificates[_certHash].issuer == address(0),
            "CertReg: certificate already exists"
        );

        // Lưu văn bằng vào mapping
        certificates[_certHash] = Certificate({
            certHash:  _certHash,
            ipfsCID:   _ipfsCID,
            issuer:    msg.sender,
            student:   _student,
            issuedAt:  block.timestamp,
            revokedAt: 0,
            isRevoked: false
        });

        // Liên kết hash với sinh viên để tiện tra cứu
        studentCertificates[_student].push(_certHash);

        emit CertificateIssued(
            _certHash,
            msg.sender,
            _student,
            _ipfsCID,
            block.timestamp
        );
    }

    /**
     * @notice Thu hồi (vô hiệu hóa) một văn bằng đã cấp.
     * @dev    Chỉ Issuer ban đầu mới được thu hồi bằng do mình cấp.
     *         Không xóa dữ liệu – chỉ đánh dấu isRevoked = true.
     *
     * @param  _certHash  Hash của văn bằng cần thu hồi.
     */
    function revokeCertificate(bytes32 _certHash)
        external
        onlyActiveIssuer
    {
        Certificate storage cert = certificates[_certHash];

        // Văn bằng phải tồn tại
        require(cert.issuer != address(0), "CertReg: certificate not found");

        // Chỉ Issuer gốc mới có quyền thu hồi
        require(
            cert.issuer == msg.sender,
            "CertReg: caller did not issue this certificate"
        );

        // Không thu hồi lần 2
        require(!cert.isRevoked, "CertReg: already revoked");

        cert.isRevoked  = true;
        cert.revokedAt  = block.timestamp;

        emit CertificateRevoked(_certHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Xác thực một văn bằng (dành cho nhà tuyển dụng / bên thứ 3).
     *
     * @dev    Bên thứ ba thực hiện quy trình:
     *           1. Nhận file metadata gốc từ sinh viên
     *           2. Tự tính hash: keccak256(abi.encode(...))
     *           3. Gọi verifyCertificate(hash) → nhận kết quả
     *
     * @param  _certHash  Hash cần xác thực.
     * @return isValid    true nếu tồn tại và chưa bị thu hồi.
     * @return issuer     Địa chỉ tổ chức cấp bằng.
     * @return student    Địa chỉ sinh viên sở hữu.
     * @return ipfsCID    CID để tải metadata đầy đủ từ IPFS.
     * @return issuedAt   Thời điểm cấp bằng (unix timestamp).
     * @return isRevoked  true nếu đã bị thu hồi.
     */
    function verifyCertificate(bytes32 _certHash)
        external
        view
        returns (
            bool    isValid,
            address issuer,
            address student,
            string  memory ipfsCID,
            uint256 issuedAt,
            bool    isRevoked
        )
    {
        Certificate storage cert = certificates[_certHash];

        // Văn bằng không tồn tại → trả về toàn bộ giá trị mặc định
        if (cert.issuer == address(0)) {
            return (false, address(0), address(0), "", 0, false);
        }

        isValid   = !cert.isRevoked;    // Hợp lệ khi chưa bị thu hồi
        issuer    = cert.issuer;
        student   = cert.student;
        ipfsCID   = cert.ipfsCID;
        issuedAt  = cert.issuedAt;
        isRevoked = cert.isRevoked;
    }

    // ──────────────────────────────────────────────────────────
    //  SECTION 8 – UTILITY / VIEW FUNCTIONS
    // ──────────────────────────────────────────────────────────

    /**
     * @notice Lấy danh sách tất cả certHash của một sinh viên.
     * @param  _student  Địa chỉ ví sinh viên.
     * @return           Mảng bytes32 chứa các certHash.
     */
    function getStudentCertificates(address _student)
        external
        view
        returns (bytes32[] memory)
    {
        return studentCertificates[_student];
    }

    /**
     * @notice Chuyển quyền Admin sang địa chỉ mới.
     * @dev    Nên dùng pattern 2-step (đề nghị + chấp nhận) cho production.
     * @param  _newAdmin  Địa chỉ Admin mới.
     */
    function transferAdmin(address _newAdmin)
        external
        onlyAdmin
    {
        require(_newAdmin != address(0), "CertReg: zero address");
        admin = _newAdmin;
    }

    /**
     * @notice Helper: tính certHash từ các trường metadata ngay trên chain.
     * @dev    Hàm tiện ích cho front-end / testing. Trong production,
     *         nên tính hash off-chain để không lộ dữ liệu qua calldata.
     *
     * @param  _studentName   Họ tên sinh viên.
     * @param  _degreeType    Loại bằng (VD: "Cử nhân CNTT").
     * @param  _graduationYear Năm tốt nghiệp.
     * @param  _gpa           GPA nhân 100 (VD: GPA 3.85 → truyền 385).
     * @param  _studentAddr   Địa chỉ ví sinh viên.
     * @return                Hash bytes32.
     */
    function computeCertHash(
        string  calldata _studentName,
        string  calldata _degreeType,
        uint256          _graduationYear,
        uint256          _gpa,
        address          _studentAddr
    )
        external
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encode(
                _studentName,
                _degreeType,
                _graduationYear,
                _gpa,
                _studentAddr
            )
        );
    }
}
