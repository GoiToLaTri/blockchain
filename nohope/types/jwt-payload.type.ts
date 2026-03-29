export class JwtPayload {
  sub?: string | null;
  exp?: number | null;
  iss?: string | null;
  scopes?: string | null;
  iat?: string | null;
  constructor() {
    this.sub = null;
    this.exp = null;
    this.iss = null;
    this.scopes = null;
    this.iat = null;
  }
}
