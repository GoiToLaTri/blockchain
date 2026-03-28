import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

module.exports = buildModule("CertificateRegistryModule", (m) => {
  const certificateRegistry = m.contract("CertificateRegistry");
  return { certificateRegistry };
});
