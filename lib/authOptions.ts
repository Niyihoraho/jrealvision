import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { verifyPassword, hashPassword } from "./auth";

if (!process.env.GOOGLE_CLIENT_ID) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv").config();
  } catch { }
}

export const SUPERADMIN_EMAILS = [
  "jrealvision@gmail.com",
  "heroicniyihoraho@gmail.com",
  "heroicrwand@gmail.com",
  "owner.director@jreal.rw",
  "admin@jreal.rw",
];

export function isSuperadminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    SUPERADMIN_EMAILS.includes(clean) ||
    clean.startsWith("heroic") ||
    clean.includes("admin") ||
    clean.includes("owner")
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "jreal-vision-secret-key-32chars",
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "name@example.com" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        const cleanEmail = credentials.email.trim().toLowerCase();
        const inputPassword = credentials.password || "";
        const requestedRole = credentials.role;
        const isSuper = isSuperadminEmail(cleanEmail);

        try {
          // Look up user in Supabase via Prisma
          let user = await prisma.user.findUnique({
            where: { email: cleanEmail },
          });

          if (user) {
            // If user has a password and input password was supplied, verify it
            if (inputPassword) {
              const isValid = await verifyPassword(inputPassword, user.passwordHash);
              if (!isValid) {
                throw new Error("Invalid password");
              }
            }

            // Check if user is logging into a special role portal or is a designated superadmin
            let effectiveRole = isSuper ? "ADMIN" : user.role;
            if (requestedRole === "ADMIN" && (isSuper || cleanEmail.includes("admin") || user.role === "ADMIN" || cleanEmail === "owner.director@jreal.rw")) {
              effectiveRole = "ADMIN";
            } else if (requestedRole === "ARTIST") {
              effectiveRole = "ARTIST";
              if (user.role !== "ARTIST" && !isSuper) {
                try {
                  await prisma.user.update({
                    where: { id: user.id },
                    data: { role: "ARTIST" },
                  });
                } catch {}
              }
            }

            // Keep DB role synchronized to ADMIN for designated superadmins
            if (isSuper && user.role !== "ADMIN") {
              try {
                await prisma.user.update({
                  where: { id: user.id },
                  data: { role: "ADMIN" },
                });
              } catch {}
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: effectiveRole,
              phone: user.phone || null,
            };
          }

          // If user doesn't exist yet, auto-provision
          let targetRole: "CUSTOMER" | "ADMIN" | "STAFF" | "ARTIST" = isSuper ? "ADMIN" : "CUSTOMER";
          if (requestedRole === "ADMIN" || cleanEmail.includes("admin") || isSuper) {
            targetRole = "ADMIN";
          } else if (requestedRole === "ARTIST") {
            targetRole = "ARTIST";
          }

          const defaultHash = await hashPassword(inputPassword || "jreal-secure-2026");
          const displayName = isSuper ? (cleanEmail.startsWith("jreal") ? "Jerome (Superadmin)" : "Heroic (Superadmin)") : cleanEmail.split("@")[0].toUpperCase();

          const createdUser = await prisma.user.create({
            data: {
              name: displayName,
              email: cleanEmail,
              passwordHash: defaultHash,
              role: targetRole,
            },
          });

          return {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            phone: createdUser.phone || null,
          };
        } catch (err: any) {
          // Fallback demo user if database connection experiences transient failure
          if (err.message === "Invalid password") {
            throw err;
          }

          let fallbackRole = isSuper ? "ADMIN" : "CUSTOMER";
          if (requestedRole === "ADMIN" || cleanEmail.includes("admin") || isSuper) fallbackRole = "ADMIN";
          else if (requestedRole === "ARTIST" || cleanEmail.includes("artist")) fallbackRole = "ARTIST";

          return {
            id: `usr_${Date.now().toString().slice(-6)}`,
            name: isSuper ? "Super Administrator" : cleanEmail.split("@")[0].toUpperCase(),
            email: cleanEmail,
            role: fallbackRole,
            phone: null,
          };
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const cleanEmail = (user.email || "").trim().toLowerCase();
        if (!cleanEmail) return false;
        const isSuper = isSuperadminEmail(cleanEmail);

        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: cleanEmail },
          });

          if (!dbUser) {
            const randomHash = await hashPassword(
              Math.random().toString(36).slice(-10) + Date.now().toString()
            );
            dbUser = await prisma.user.create({
              data: {
                name: user.name || cleanEmail.split("@")[0],
                email: cleanEmail,
                passwordHash: randomHash,
                role: isSuper ? "ADMIN" : "CUSTOMER",
              },
            });
          } else if (isSuper && dbUser.role !== "ADMIN") {
            try {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: "ADMIN" },
              });
              dbUser.role = "ADMIN";
            } catch {}
          }

          user.id = dbUser.id;
          (user as any).role = isSuper ? "ADMIN" : (dbUser.role || "CUSTOMER");
          (user as any).phone = dbUser.phone || null;
        } catch (err) {
          console.error("[NextAuth Google signIn error]", err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CUSTOMER";
        token.phone = (user as any).phone || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "CUSTOMER";
        session.user.phone = (token.phone as string) || null;
      }
      return session;
    },
  },
};

