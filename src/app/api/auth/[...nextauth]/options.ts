import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { getPrismaClientSync } from "@/helpers/prisma";
import { Adapter } from "next-auth/adapters";
import { UserRole } from "@prisma/client";

// We need to define our options with a function to properly handle async access to Prisma
export const getAuthOptions = async (): Promise<NextAuthOptions> => {
  // Get the Prisma client
  const prisma = await getPrismaClientSync();

  return {
    adapter: prisma ? (PrismaAdapter(prisma) as Adapter) : undefined,
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password || !prisma) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          };
        },
      }),
    ],
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async jwt({ token, user, account }) {
        if (account && user && prisma) {
          if (account.provider === "google") {
            const email = token.email as string;
            let dbUser = await prisma.user.findUnique({
              where: { email },
            });

            if (!dbUser) {
              const nameParts = ((token.name as string) || "").split(" ");
              const firstName = nameParts[0] || "User";
              const lastName = nameParts.slice(1).join(" ") || "";

              dbUser = await prisma.user.create({
                data: {
                  email,
                  firstName,
                  lastName,
                  password: "",
                  role: UserRole.CUSTOMER,
                },
              });
            }

            token.id = dbUser.id;
            token.role = dbUser.role;
            token.firstName = dbUser.firstName;
            token.lastName = dbUser.lastName;
          } else {
            token.id = user.id;
            token.role = user.role;
            token.firstName = user.firstName;
            token.lastName = user.lastName;
          }
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as UserRole;
          session.user.firstName = token.firstName as string;
          session.user.lastName = token.lastName as string;
        }
        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
};

// For compatibility with existing imports
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        // This will be replaced by the actual implementation when getAuthOptions is called
        return null;
      },
    }),
  ],
};
