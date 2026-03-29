import { JwtPayload } from "@/types/jwt-payload.type";
import fs from "fs";
import path from "path";
import * as jwt from "jsonwebtoken";
import { jwtVerify, importSPKI } from "jose";

const PRIVATE_KEY_PATH = path.join(process.cwd(), "certs/private.pem");
const PUBLIC_KEY_PATH = path.join(process.cwd(), "certs/public.pem");
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, "utf-8");
const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH, "utf-8");

export function signToken(payload: JwtPayload) {
  return jwt.sign({ payload }, PRIVATE_KEY, { algorithm: "RS256" });
}

// export function verifyToken(token: string) {
//   return jwt.verify(token, PUBLIC_KEY);
// }
