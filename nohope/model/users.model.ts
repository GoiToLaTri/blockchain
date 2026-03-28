import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  address: String,
  role: String,
  email: String,
});

export const User = mongoose.model("users", userSchema);
