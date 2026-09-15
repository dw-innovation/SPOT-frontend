import crypto from "crypto";
import { Session } from "next-auth";

// Derive a stable, pseudonymous user identifier from the session.
// DW / KID2 accounts get a readable prefix; KID2 test accounts stay in plain text.
export const anonymizeUser = (session: Session | null): string | undefined => {
  const userName = session?.user?.name;
  if (!userName) return undefined;

  const userEmail = session?.user?.email || "";
  const APP_SALT = process.env.APP_SALT || "";
  const isKid2 = userName.toLowerCase().includes("kid2");

  const prefix = [
    userEmail.toLowerCase().endsWith("@dw.com") ? "DW" : null,
    isKid2 ? "KID2" : null,
  ]
    .filter(Boolean)
    .join("-");

  const hash = crypto
    .createHash("sha256")
    .update(userName + APP_SALT)
    .digest("hex");

  // KID2 accounts are internal test users — keep them identifiable in the logs.
  return isKid2 ? userName : prefix ? `${prefix}-${hash.slice(-5)}` : hash.slice(-5);
};
