import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorToken: { label: "2FA Token", type: "text" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Check lock status
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account locked due to too many failed attempts. Try again later.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          const attempts = user.failedLoginAttempts + 1;
          const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
          
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: attempts, lockedUntil }
          });

          // Log failed attempt for admins
          if (["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"].includes(user.role)) {
            await prisma.auditLog.create({
              data: {
                adminId: user.id,
                action: "LOGIN_FAILED",
                ipAddress: req?.headers?.["x-forwarded-for"] || "Unknown IP",
                device: req?.headers?.["user-agent"] || "Unknown Device",
              }
            });
          }

          throw new Error("Invalid credentials");
        }

        // Reset failed attempts on correct password
        if (user.failedLoginAttempts > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null }
          });
        }

        // Admin 2FA Requirement
        const isAdmin = ["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"].includes(user.role);
        
        if (isAdmin && user.twoFactorEnabled) {
          // Temporarily bypassing 2FA check
          // if (!credentials.twoFactorToken) {
          //   throw new Error("2FA_REQUIRED");
          // }
          // 
          // if (!user.twoFactorSecret) {
          //   throw new Error("2FA configuration error");
          // }
          // 
          // const isTokenValid = authenticator.check(credentials.twoFactorToken, user.twoFactorSecret);
          // if (!isTokenValid) {
          //    throw new Error("Invalid 2FA token");
          // }
        }
        
        if (isAdmin) {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          });
          
          await prisma.auditLog.create({
            data: {
              adminId: user.id,
              action: "LOGIN_SUCCESS",
              ipAddress: req?.headers?.["x-forwarded-for"] || "Unknown IP",
              device: req?.headers?.["user-agent"] || "Unknown Device",
            }
          });
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Kept /login for patients, admins will use /admin/login
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
