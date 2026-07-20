import { NextAuth } from "@auth/nextjs";

export const { handlers, auth } = NextAuth({
  providers: [],
  trustHost: true,
});