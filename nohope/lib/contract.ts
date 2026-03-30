import { ethers } from "ethers";
import contractJson from "../abi/CertificateRegistry.json"; // ABI file sau khi compile

// ─────────────────────────────────────────────────────────────────────────────
//  Types – ánh xạ struct Solidity sang TypeScript
// ─────────────────────────────────────────────────────────────────────────────

export interface IssuerInfo {
  name: string; // Tên tổ chức
  isActive: boolean; // Đang hoạt động?
  addedAt: number; // Unix timestamp lúc thêm vào
}

export interface CertificateInfo {
  certHash: string; // bytes32 dưới dạng hex string "0x..."
  ipfsCID: string; // IPFS Content ID
  issuer: string; // Địa chỉ tổ chức cấp bằng
  student: string; // Địa chỉ sinh viên
  issuedAt: number; // Unix timestamp cấp bằng
  revokedAt: number; // Unix timestamp thu hồi (0 nếu chưa)
  isRevoked: boolean; // Đã bị thu hồi chưa?
}

export interface VerifyResult {
  isValid: boolean; // Hợp lệ (tồn tại & chưa bị thu hồi)?
  issuer: string;
  student: string;
  ipfsCID: string;
  issuedAt: number;
  isRevoked: boolean;
}

export interface CertificateHashInput {
  studentName: string;
  studentAddress: string;
  certificateType: string;
  specialization?: string | null;
  gpa?: number | null;
  graduationDate?: string | null;
  issuerAddress: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ContractService
// ─────────────────────────────────────────────────────────────────────────────

export class ContractService {
  private address: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private abi: any;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private contract: ethers.Contract;

  constructor(signer?: ethers.Signer) {
    const address = process.env.CONTRACT_ADDRESS;
    const rpcUrl = process.env.RPC_URL;

    if (!address) throw new Error("Missing CONTRACT_ADDRESS");
    if (!rpcUrl) throw new Error("Missing RPC_URL");

    this.address = address;
    this.abi = contractJson.abi;

    // Nếu có signer (MetaMask / private key) → ưu tiên dùng để gửi tx
    if (signer) {
      this.signer = signer;
      this.provider = signer.provider!;
    } else {
      // Chỉ đọc (view / pure) – không cần signer
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    this.contract = new ethers.Contract(
      this.address,
      this.abi,
      this.signer ?? this.provider,
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  SECTION 1 – QUẢN LÝ ISSUER (Admin functions)
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * [WRITE – onlyAdmin]
   * Thêm hoặc cập nhật một tổ chức vào danh sách Trusted Issuers.
   *
   * @param issuerAddress  Địa chỉ ví của tổ chức cấp bằng.
   * @param universityName Tên tổ chức lưu on-chain.
   * @returns              Transaction receipt sau khi block confirm.
   *
   * @example
   * await service.addIssuer("0xAbc...", "Đại học Bách Khoa");
   */
  async addIssuer(
    issuerAddress: string,
    universityName: string,
  ): Promise<ethers.TransactionReceipt> {
    console.log(
      `[addIssuer] Thêm tổ chức: "${universityName}" (${issuerAddress})`,
    );

    const tx: ethers.TransactionResponse = await this.contract.addIssuer(
      issuerAddress,
      universityName,
    );

    console.log(`[addIssuer] Đã gửi tx: ${tx.hash} – đang chờ xác nhận...`);
    const receipt = await tx.wait();

    if (!receipt) throw new Error("Không nhận được receipt từ mạng.");
    console.log(`[addIssuer] Thành công! Block: ${receipt.blockNumber}`);
    return receipt;
  }

  /**
   * [WRITE – onlyAdmin]
   * Vô hiệu hóa quyền cấp bằng của một tổ chức (đặt isActive = false).
   * Lịch sử văn bằng đã cấp vẫn còn tra cứu được.
   *
   * @param issuerAddress  Địa chỉ ví tổ chức cần vô hiệu hóa.
   * @returns              Transaction receipt sau khi block confirm.
   *
   * @example
   * await service.removeIssuer("0xAbc...");
   */
  async removeIssuer(
    issuerAddress: string,
  ): Promise<ethers.TransactionReceipt> {
    console.log(`[removeIssuer] Vô hiệu hóa issuer: ${issuerAddress}`);

    const tx: ethers.TransactionResponse =
      await this.contract.removeIssuer(issuerAddress);

    console.log(`[removeIssuer] Đã gửi tx: ${tx.hash} – đang chờ xác nhận...`);
    const receipt = await tx.wait();

    if (!receipt) throw new Error("Không nhận được receipt từ mạng.");
    console.log(`[removeIssuer] ✅ Thành công! Block: ${receipt.blockNumber}`);
    return receipt;
  }

  /**
   * [READ – view]
   * Kiểm tra một địa chỉ có phải Issuer đang hoạt động không.
   *
   * @param issuerAddress  Địa chỉ cần kiểm tra.
   * @returns              true nếu là issuer đang hoạt động.
   *
   * @example
   * const ok = await service.verifyIssuer("0xAbc...");
   */
  async verifyIssuer(issuerAddress: string): Promise<boolean> {
    const result: boolean = await this.contract.verifyIssuer(issuerAddress);
    return result;
  }

  /**
   * [READ – mapping public]
   * Lấy thông tin chi tiết của một Issuer từ mapping issuers[].
   *
   * @param issuerAddress  Địa chỉ ví cần tra cứu.
   * @returns              IssuerInfo { name, isActive, addedAt }
   *
   * @example
   * const info = await service.getIssuerInfo("0xAbc...");
   * console.log(info.name, info.isActive);
   */
  async getIssuerInfo(issuerAddress: string): Promise<IssuerInfo> {
    // Gọi getter tự động của mapping public issuers(address)
    const raw = await this.contract.issuers(issuerAddress);
    return {
      name: raw.name,
      isActive: raw.isActive,
      addedAt: Number(raw.addedAt), // BigInt → number (safe dưới 2^53)
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  SECTION 2 – VÒNG ĐỜI VĂN BẰNG (Certificate lifecycle)
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * [WRITE – onlyActiveIssuer]
   * Cấp một văn bằng mới cho sinh viên.
   *
   * Quy trình off-chain cần làm trước:
   *   1. Tạo metadata JSON { studentName, degree, gpa, ... }
   *   2. Upload JSON lên IPFS → lấy CID
   *   3. Tính certHash = keccak256(abi.encode(...)) – xem computeCertHash()
   *   4. Gọi hàm này với kết quả bước 2 và 3
   *
   * @param studentAddress  Địa chỉ ví sinh viên nhận bằng.
   * @param certHash        Hash bytes32 (dạng "0x...") tính từ metadata gốc.
   * @param ipfsCID         IPFS Content ID chứa metadata JSON.
   * @returns               Transaction receipt sau khi block confirm.
   *
   * @example
   * const hash = await service.computeCertHash("Nguyễn Văn A", "Cử nhân CNTT", 2024, 385, "0xStu...");
   * await service.issueCertificate("0xStu...", hash, "QmXyz...");
   */
  async issueCertificate(
    studentAddress: string,
    certHash: string,
    ipfsCID: string,
  ): Promise<ethers.TransactionReceipt> {
    console.log(`[issueCertificate] Cấp bằng cho: ${studentAddress}`);
    console.log(`  certHash : ${certHash}`);
    console.log(`  ipfsCID  : ${ipfsCID}`);

    const tx: ethers.TransactionResponse = await this.contract.issueCertificate(
      studentAddress,
      certHash, // ethers tự chuyển "0x..." → bytes32
      ipfsCID,
    );

    console.log(
      `[issueCertificate] Đã gửi tx: ${tx.hash} – đang chờ xác nhận...`,
    );
    const receipt = await tx.wait();

    if (!receipt) throw new Error("Không nhận được receipt từ mạng.");
    console.log(
      `[issueCertificate] ✅ Thành công! Block: ${receipt.blockNumber}`,
    );
    return receipt;
  }

  /**
   * [WRITE – onlyActiveIssuer]
   * Thu hồi một văn bằng đã cấp (chỉ Issuer gốc mới được thu hồi).
   * Dữ liệu không bị xóa, chỉ đánh dấu isRevoked = true.
   *
   * @param certHash  Hash bytes32 của văn bằng cần thu hồi.
   * @returns         Transaction receipt sau khi block confirm.
   *
   * @example
   * await service.revokeCertificate("0xabc123...");
   */
  async revokeCertificate(
    certHash: string,
  ): Promise<ethers.TransactionReceipt> {
    console.log(`[revokeCertificate] Thu hồi văn bằng: ${certHash}`);

    const tx: ethers.TransactionResponse =
      await this.contract.revokeCertificate(certHash);

    console.log(
      `[revokeCertificate] Đã gửi tx: ${tx.hash} – đang chờ xác nhận...`,
    );
    const receipt = await tx.wait();

    if (!receipt) throw new Error("Không nhận được receipt từ mạng.");
    console.log(
      `[revokeCertificate] ✅ Thành công! Block: ${receipt.blockNumber}`,
    );
    return receipt;
  }

  /**
   * [READ – view]
   * Xác thực một văn bằng (dành cho nhà tuyển dụng / bên thứ 3).
   *
   * Quy trình bên thứ 3:
   *   1. Nhận file metadata gốc từ sinh viên
   *   2. Tự tính hash (dùng computeCertHashOffchain() bên dưới)
   *   3. Gọi hàm này → nhận kết quả
   *
   * @param certHash  Hash bytes32 cần xác thực.
   * @returns         VerifyResult { isValid, issuer, student, ipfsCID, issuedAt, isRevoked }
   *
   * @example
   * const result = await service.verifyCertificate("0xabc123...");
   * if (result.isValid) console.log("Văn bằng hợp lệ!");
   */
  async verifyCertificate(certHash: string): Promise<VerifyResult> {
    const raw = await this.contract.verifyCertificate(certHash);
    return {
      isValid: raw.isValid,
      issuer: raw.issuer,
      student: raw.student,
      ipfsCID: raw.ipfsCID,
      issuedAt: Number(raw.issuedAt),
      isRevoked: raw.isRevoked,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  SECTION 3 – UTILITY / VIEW FUNCTIONS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * [READ – view]
   * Lấy toàn bộ thông tin của một văn bằng từ mapping certificates[].
   *
   * @param certHash  Hash bytes32 của văn bằng.
   * @returns         CertificateInfo hoặc null nếu không tồn tại.
   *
   * @example
   * const cert = await service.getCertificate("0xabc...");
   */
  async getCertificate(certHash: string): Promise<CertificateInfo | null> {
    // Gọi getter tự động của mapping public certificates(bytes32)
    const raw = await this.contract.certificates(certHash);

    // issuer === address(0) nghĩa là văn bằng chưa được tạo
    if (raw.issuer === ethers.ZeroAddress) return null;

    return {
      certHash: raw.certHash,
      ipfsCID: raw.ipfsCID,
      issuer: raw.issuer,
      student: raw.student,
      issuedAt: Number(raw.issuedAt),
      revokedAt: Number(raw.revokedAt),
      isRevoked: raw.isRevoked,
    };
  }

  /**
   * [READ – view]
   * Lấy danh sách tất cả certHash của một sinh viên.
   *
   * @param studentAddress  Địa chỉ ví sinh viên.
   * @returns               Mảng các certHash dưới dạng hex string.
   *
   * @example
   * const hashes = await service.getStudentCertificates("0xStu...");
   */
  async getStudentCertificates(studentAddress: string): Promise<string[]> {
    const hashes: string[] =
      await this.contract.getStudentCertificates(studentAddress);
    return hashes;
  }

  /**
   * [READ – view]
   * Tiện ích: lấy đầy đủ thông tin của TẤT CẢ văn bằng thuộc về một sinh viên.
   * Hàm này kết hợp getStudentCertificates() + getCertificate() để tránh
   * phải gọi nhiều lần từ phía client.
   *
   * @param studentAddress  Địa chỉ ví sinh viên.
   * @returns               Mảng CertificateInfo (bỏ qua hash không tồn tại).
   *
   * @example
   * const certs = await service.getAllCertificatesOfStudent("0xStu...");
   */
  async getAllCertificatesOfStudent(
    studentAddress: string,
  ): Promise<CertificateInfo[]> {
    const hashes = await this.getStudentCertificates(studentAddress);

    // Promise.all để song song hóa các lần gọi view (tiết kiệm thời gian)
    const results = await Promise.all(
      hashes.map((h) => this.getCertificate(h)),
    );

    // Lọc bỏ null (phòng ngừa dữ liệu bất thường)
    return results.filter((c): c is CertificateInfo => c !== null);
  }

  /**
   * [WRITE – onlyAdmin]
   * Chuyển quyền Admin sang địa chỉ mới.
   * Lưu ý: nên dùng pattern 2-step (propose + accept) cho môi trường production.
   *
   * @param newAdminAddress  Địa chỉ Admin mới.
   * @returns                Transaction receipt sau khi block confirm.
   *
   * @example
   * await service.transferAdmin("0xNewAdmin...");
   */
  async transferAdmin(
    newAdminAddress: string,
  ): Promise<ethers.TransactionReceipt> {
    console.log(`[transferAdmin] Chuyển quyền admin sang: ${newAdminAddress}`);

    const tx: ethers.TransactionResponse =
      await this.contract.transferAdmin(newAdminAddress);

    console.log(`[transferAdmin] Đã gửi tx: ${tx.hash} – đang chờ xác nhận...`);
    const receipt = await tx.wait();

    if (!receipt) throw new Error("Không nhận được receipt từ mạng.");
    console.log(`[transferAdmin] ✅ Thành công! Block: ${receipt.blockNumber}`);
    return receipt;
  }

  /**
   * [READ – view]
   * Đọc địa chỉ Admin hiện tại từ state variable public `admin`.
   *
   * @returns  Địa chỉ ví của Admin hiện tại.
   *
   * @example
   * const adminAddr = await service.getAdmin();
   */
  async getAdmin(): Promise<string> {
    return await this.contract.admin();
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  SECTION 4 – HASH HELPERS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * [READ – pure, gọi on-chain]
   * Tính certHash bằng cách gọi hàm computeCertHash() trên contract.
   * Tiện dụng cho testing / front-end dev, nhưng trong production nên dùng
   * computeCertHashOffchain() để tránh lộ dữ liệu nhạy cảm qua calldata.
   *
   * GPA truyền vào dưới dạng nguyên (nhân 100): GPA 3.85 → 385.
   *
   * @param studentName     Họ tên sinh viên.
   * @param degreeType      Loại bằng (VD: "Cử nhân CNTT").
   * @param graduationYear  Năm tốt nghiệp.
   * @param gpa             GPA × 100 (số nguyên).
   * @param studentAddress  Địa chỉ ví sinh viên.
   * @returns               certHash dưới dạng hex string "0x...".
   *
   * @example
   * const hash = await service.computeCertHashOnchain("Nguyễn Văn A", "Cử nhân CNTT", 2024, 385, "0xStu...");
   */
  async computeCertHashOnchain(
    studentName: string,
    degreeType: string,
    graduationYear: number,
    gpa: number,
    studentAddress: string,
  ): Promise<string> {
    const hash: string = await this.contract.computeCertHash(
      studentName,
      degreeType,
      BigInt(graduationYear), // Solidity uint256 → BigInt
      BigInt(gpa),
      studentAddress,
    );
    return hash;
  }

  /**
   * [LOCAL – pure, không cần mạng]
   * Tính certHash hoàn toàn off-chain bằng ethers.js.
   * Kết quả PHẢI khớp với hàm computeCertHash() trên contract vì dùng
   * cùng encoding: keccak256(abi.encode(string, string, uint256, uint256, address)).
   *
   * Dùng cách này trong production để không lộ dữ liệu nhạy cảm.
   *
   * @param studentName     Họ tên sinh viên.
   * @param degreeType      Loại bằng.
   * @param graduationYear  Năm tốt nghiệp.
   * @param gpa             GPA × 100 (số nguyên).
   * @param studentAddress  Địa chỉ ví sinh viên.
   * @returns               certHash dưới dạng hex string "0x...".
   *
   * @example
   * const hash = ContractService.computeCertHashOffchain("Nguyễn Văn A", "Cử nhân CNTT", 2024, 385, "0xStu...");
   */
  static computeCertHashOffchain(
    studentName: string,
    degreeType: string,
    graduationYear: number,
    gpa: number,
    studentAddress: string,
  ): string {
    // ABI encode theo đúng thứ tự và kiểu dữ liệu trong Solidity
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string", "uint256", "uint256", "address"],
      [
        studentName,
        degreeType,
        BigInt(graduationYear),
        BigInt(gpa),
        studentAddress,
      ],
    );
    return ethers.keccak256(encoded);
  }

  /**
   * [LOCAL – pure, không cần mạng]
   * Tính hash cho toàn bộ metadata văn bằng theo payload canonical JSON.
   *
   * @param input  Metadata văn bằng đã chuẩn hóa.
   * @returns      certHash dưới dạng hex string "0x...".
   */
  static computeCertificateHashOffchain(input: CertificateHashInput): string {
    const normalized = {
      studentName: input.studentName.trim(),
      studentAddress: ethers.getAddress(input.studentAddress),
      certificateType: input.certificateType.trim(),
      specialization: input.specialization?.trim() || null,
      gpa: input.gpa ?? null,
      graduationDate: input.graduationDate?.trim() || null,
      issuerAddress: ethers.getAddress(input.issuerAddress),
    };

    return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(normalized)));
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  SECTION 5 – EVENT LISTENERS (Lắng nghe sự kiện real-time)
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Đăng ký lắng nghe sự kiện IssuerAdded phát ra từ contract.
   * Hữu ích cho dashboard admin theo dõi real-time.
   *
   * @param callback  Hàm được gọi mỗi khi event xảy ra.
   * @returns         Hàm unsubscribe để huỷ đăng ký khi không cần nữa.
   *
   * @example
   * const unsub = service.onIssuerAdded((addr, name, ts) => console.log(addr, name));
   * // Khi không cần nữa:
   * unsub();
   */
  onIssuerAdded(
    callback: (issuerAddr: string, name: string, timestamp: number) => void,
  ): () => void {
    const handler = (issuerAddr: string, name: string, timestamp: bigint) => {
      callback(issuerAddr, name, Number(timestamp));
    };
    this.contract.on("IssuerAdded", handler);
    // Trả về hàm cleanup
    return () => {
      this.contract.off("IssuerAdded", handler);
    };
  }

  /**
   * Đăng ký lắng nghe sự kiện CertificateIssued.
   *
   * @param callback  Hàm được gọi mỗi khi văn bằng mới được cấp.
   * @returns         Hàm unsubscribe.
   *
   * @example
   * const unsub = service.onCertificateIssued((hash, issuer, student, cid, ts) => { ... });
   */
  onCertificateIssued(
    callback: (
      certHash: string,
      issuer: string,
      student: string,
      ipfsCID: string,
      timestamp: number,
    ) => void,
  ): () => void {
    const handler = (
      certHash: string,
      issuer: string,
      student: string,
      ipfsCID: string,
      timestamp: bigint,
    ) => {
      callback(certHash, issuer, student, ipfsCID, Number(timestamp));
    };
    this.contract.on("CertificateIssued", handler);
    return () => {
      this.contract.off("CertificateIssued", handler);
    };
  }

  /**
   * Đăng ký lắng nghe sự kiện CertificateRevoked.
   *
   * @param callback  Hàm được gọi mỗi khi văn bằng bị thu hồi.
   * @returns         Hàm unsubscribe.
   *
   * @example
   * const unsub = service.onCertificateRevoked((hash, revokedBy, ts) => { ... });
   */
  onCertificateRevoked(
    callback: (certHash: string, revokedBy: string, timestamp: number) => void,
  ): () => void {
    const handler = (
      certHash: string,
      revokedBy: string,
      timestamp: bigint,
    ) => {
      callback(certHash, revokedBy, Number(timestamp));
    };
    this.contract.on("CertificateRevoked", handler);
    return () => {
      this.contract.off("CertificateRevoked", handler);
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  SECTION 6 – MISC
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Lấy instance ethers.Contract thô (dùng khi cần gọi hàm không được
   * bọc ở trên hoặc để truyền vào thư viện khác).
   */
  getInstance(): ethers.Contract {
    return this.contract;
  }

  /** Địa chỉ contract đang kết nối. */
  getAddress(): string {
    return this.address;
  }
}
