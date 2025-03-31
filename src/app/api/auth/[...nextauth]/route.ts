import NextAuth from "next-auth";
import { getAuthOptions } from "./options";

// Define params as a Promise type with string array for nextauth segments
type Params = Promise<{ nextauth: string[] }>;

/**
 * Handler for NextAuth.js API routes
 */
async function handler(req: Request, context: { params: Params }) {
  // Await to get the resolved params
  const params = await context.params;
  
  const authOptions = await getAuthOptions();
  return NextAuth(authOptions)(req, { params });
}

export { handler as GET, handler as POST };
