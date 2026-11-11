import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";

import mongoClientPromise from "./mongoClient";

const parseEnvCredentials = (envCreds: string) => {
  const credsArray = envCreds.split(";").map((cred) => {
    const [username, password] = cred.split(":");
    return { username, password };
  });
  return credsArray;
};

// Magic links are limited to these domains for now.
const ALLOWED_EMAIL_DOMAINS = ["dw.com", "dot.studio"];

const isAllowedEmail = (email?: string | null) => {
  const domain = email?.trim().toLowerCase().split("@").pop();
  return !!domain && ALLOWED_EMAIL_DOMAINS.includes(domain);
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // The adapter is only used to store the one-time magic-link tokens (and the
  // user record they create); sessions themselves stay JWT.
  adapter: MongoDBAdapter(mongoClientPromise(), {
    databaseName: process.env.MONGODB_DBNAME,
  }),
  providers: [
    EmailProvider({
      server: {
        host: process.env.MAIL_IMAP,
        port: Number(process.env.MAIL_PORT || 465),
        secure: Number(process.env.MAIL_PORT || 465) === 465,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      from: process.env.MAIL_ACCOUNT,
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
    // Runs when a link is requested (so no mail goes to other addresses) and
    // again when it is clicked. Credentials logins are unaffected.
    signIn: ({ account, user }) =>
      account?.provider !== "email" || isAllowedEmail(user.email),
  },
  session: {
    strategy: "jwt",
  },
};
