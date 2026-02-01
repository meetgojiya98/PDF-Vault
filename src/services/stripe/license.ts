import { SignJWT, jwtVerify } from "jose";

export type LicensePayload = {
  customerId: string;
  email: string;
  proActive: boolean;
  exportCredits: number;
  exp: number;
};

const ISSUER = "pdf-vault";
const AUDIENCE = "pdf-vault-app";

export async function signLicense(payload: LicensePayload, privateKey: string) {
  const key = await importPrivateKey(privateKey);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(payload.exp)
    .sign(key);
}

export async function verifyLicense(token: string, publicKey: string): Promise<LicensePayload> {
  const key = await importPublicKey(publicKey);
  const { payload } = await jwtVerify(token, key, { 
    issuer: ISSUER,
    audience: AUDIENCE
  });
  return payload as unknown as LicensePayload;
}

async function importPrivateKey(pem: string) {
  const { importPKCS8 } = await import("jose");
  return importPKCS8(pem, "RS256");
}

async function importPublicKey(pem: string) {
  const { importSPKI } = await import("jose");
  return importSPKI(pem, "RS256");
}
