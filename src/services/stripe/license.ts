import { SignJWT, jwtVerify } from "jose";

export type LicensePayload = {
  proActive: boolean;
  exportCredits: number;
  expiresAt: number | null;
  email: string;
};

const ISSUER = "pdf-toolbox";

export async function signLicense(payload: LicensePayload, privateKey: string) {
  const key = await importPrivateKey(privateKey);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "ES256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt ? Math.floor(payload.expiresAt / 1000) : "30d")
    .sign(key);
}

export async function verifyLicense(token: string, publicKey: string) {
  const key = await importPublicKey(publicKey);
  const { payload } = await jwtVerify(token, key, { issuer: ISSUER });
  return payload as LicensePayload;
}

async function importPrivateKey(pem: string) {
  return importPKCS8(pem, "ES256");
}

async function importPublicKey(pem: string) {
  return importSPKI(pem, "ES256");
}

async function importPKCS8(pem: string, alg: "ES256") {
  const { importPKCS8 } = await import("jose");
  return importPKCS8(pem, alg);
}

async function importSPKI(pem: string, alg: "ES256") {
  const { importSPKI } = await import("jose");
  return importSPKI(pem, alg);
}
