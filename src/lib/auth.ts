import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { randomInt } from "crypto";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { createTransport } from "nodemailer";

import mongoClientPromise from "./mongoClient";

const parseEnvCredentials = (envCreds: string) => {
  const credsArray = envCreds.split(";").map((cred) => {
    const [username, password] = cred.split(":");
    return { username, password };
  });
  return credsArray;
};

// Email sign-in can be limited to a comma-separated list of domains via
// EMAIL_ALLOWED_DOMAINS (e.g. "dw.com,dot.studio" for the pilot on production).
// Unset or "*" allows every address (staging, later production).
const ALLOWED_EMAIL_DOMAINS = (process.env.EMAIL_ALLOWED_DOMAINS ?? "*")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

const isAllowedEmail = (email?: string | null) => {
  if (ALLOWED_EMAIL_DOMAINS.includes("*")) return !!email?.trim();
  const domain = email?.trim().toLowerCase().split("@").pop();
  return !!domain && ALLOWED_EMAIL_DOMAINS.includes(domain);
};

const CODE_MAX_AGE_SECONDS = 10 * 60;

const mailServer = {
  host: process.env.MAIL_IMAP,
  port: Number(process.env.MAIL_PORT || 465),
  secure: Number(process.env.MAIL_PORT || 465) === 465,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
};

const MAX_CODE_ATTEMPTS = 3;

// Wraps the Mongo adapter so a code dies after MAX_CODE_ATTEMPTS wrong guesses
// (NextAuth itself would let an attacker try the code as often as they like).
const withAttemptLimit = (base: Adapter): Adapter => {
  const collections = async () => {
    const db = (await mongoClientPromise()).db(process.env.MONGODB_DBNAME);
    return {
      attempts: db.collection<{ _id: string; count: number }>(
        "verification_attempts"
      ),
      tokens: db.collection<{ identifier: string }>("verification_tokens"),
    };
  };

  return {
    ...base,
    createVerificationToken: async (data) => {
      const { attempts } = await collections();
      await attempts.deleteOne({ _id: data.identifier });
      return base.createVerificationToken!(data);
    },
    useVerificationToken: async (params) => {
      const { attempts, tokens } = await collections();
      const result = await base.useVerificationToken!(params);
      if (result) {
        await attempts.deleteOne({ _id: params.identifier });
        return result;
      }
      const updated = await attempts.findOneAndUpdate(
        { _id: params.identifier },
        { $inc: { count: 1 } },
        { upsert: true, returnDocument: "after" }
      );
      if ((updated?.count ?? 0) >= MAX_CODE_ATTEMPTS) {
        await tokens.deleteMany({ identifier: params.identifier });
        await attempts.deleteOne({ _id: params.identifier });
      }
      return null;
    },
  };
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // The adapter is only used to store the one-time magic-link tokens (and the
  // user record they create); sessions themselves stay JWT.
  adapter: withAttemptLimit(
    MongoDBAdapter(mongoClientPromise(), {
      databaseName: process.env.MONGODB_DBNAME,
    })
  ),
  providers: [
    // One-time 6-digit code instead of a link: the code is stored (hashed) as
    // the verification token and redeemed via /api/auth/callback/email.
    EmailProvider({
      server: mailServer,
      from: process.env.MAIL_ACCOUNT,
      maxAge: CODE_MAX_AGE_SECONDS,
      generateVerificationToken: () => randomInt(0, 1_000_000).toString().padStart(6, "0"),
      sendVerificationRequest: async ({ identifier, token, provider }) => {
        const minutes = CODE_MAX_AGE_SECONDS / 60;
        const result = await createTransport(provider.server).sendMail({
          to: identifier,
          from: provider.from,
          subject: `Your Spot sign-in code: ${token}`,
          text: `Your Spot sign-in code is ${token}\n\nIt is valid for ${minutes} minutes. If you did not request it, you can ignore this email.`,
          html: `<p>Your Spot sign-in code is</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px;font-family:monospace">${token}</p><p>It is valid for ${minutes} minutes. If you did not request it, you can ignore this email.</p>`,
        });
        const failed = [...result.rejected, ...result.pending].filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials || {};
        const envCreds = process.env.CREDENTIALS;

        if (!envCreds) {
          throw new Error("Credentials environment variable not set");
        }

        const parsedCredentials = parseEnvCredentials(envCreds);

        const user = parsedCredentials.find(
          (userCred) =>
            userCred.username === username && userCred.password === password
        );

        if (user) {
          return {
            id: user.username,
            name: user.username,
            email: user.username,
          };
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Magic-link users have an email but no name, and the API routes identify
    // users by session.user.name; fall back to the email for them.
    jwt: ({ token }) => {
      token.name ??= token.email;
      return token;
    },
    // Runs when a code is requested (so no mail goes to other addresses) and
    // again when it is redeemed. Credentials logins are unaffected.
    signIn: ({ account, user }) =>
      account?.provider !== "email" || isAllowedEmail(user.email),
  },
  session: {
    strategy: "jwt",
  },
};
