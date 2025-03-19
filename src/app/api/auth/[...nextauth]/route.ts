import NextAuth from "next-auth";
import { getAuthOptions } from "./options";

/**
 * Handler for NextAuth.js API routes
 */
async function handler(req: Request, context: any) {
  const authOptions = await getAuthOptions();
  return NextAuth(authOptions)(req, context);
}

export { handler as GET, handler as POST };
