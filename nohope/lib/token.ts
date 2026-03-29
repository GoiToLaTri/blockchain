import { JwtPayload } from "@/types/jwt-payload.type";
import fs from "fs";
import path from "path";
import * as jwt from "jsonwebtoken";

const PRIVATE_KEY_PATH = path.join(process.cwd(), "certs/private.pem");
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, "utf-8");

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, PRIVATE_KEY, { algorithm: "RS256" });
}

// export function verifyToken(token: string) {
//   return jwt.verify(token, PUBLIC_KEY);
// }
