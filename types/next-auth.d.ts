import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      plan?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    plan?: string | null;
  }
}
