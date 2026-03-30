import mongoose from "mongoose";

const issuerSchema = new mongoose.Schema({
  name: String,
  address: String,
  isActive: Boolean,
});

export const Issuer =
  mongoose.models.issuers || mongoose.model("issuers", issuerSchema);
