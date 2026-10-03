// JREAL VISION DESIGN — Auth Utilities
// JWT-based auth with bcrypt password hashing + NextAuth integration

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "jreal-vision-dev-secret-key-32chars";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

// Extract auth user from request (checks NextAuth session, Authorization header, and HTTP-only cookie)
export async function getSessionUser(req: NextApiRequest, res: NextApiResponse): Promise<AuthUser | null> {
  try {
    // 1. NextAuth session check
    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.email) {
      return {
        id: session.user.id || "usr_session",
        name: session.user.name || session.user.email.split("@")[0].toUpperCase(),
        email: session.user.email,
        role: session.user.role || "CUSTOMER",
        phone: session.user.phone,
      };
    }
  } catch {
    // Continue to legacy token check
  }

  return getAuthUser(req);
}

// Synchronous extraction from header or cookie
export function getAuthUser(req: NextApiRequest): AuthUser | null {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }

  // Check custom cookie
  const token = req.cookies?.jreal_token;
  if (token) {
    return verifyToken(token);
  }

  return null;
}

// Middleware: require authenticated user
export function requireAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, user: AuthUser) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (await getSessionUser(req, res)) || getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    return handler(req, res, user);
  };
}

// Middleware: require specific role (RBAC)
export function requireRole(
  allowedRoles: string[],
  handler: (req: NextApiRequest, res: NextApiResponse, user: AuthUser) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (await getSessionUser(req, res)) || getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of: ${allowedRoles.join(", ")}`,
        currentRole: user.role,
      });
    }
    return handler(req, res, user);
  };
}

// Middleware: require admin role
export function requireAdmin(
  handler: (req: NextApiRequest, res: NextApiResponse, user: AuthUser) => Promise<void>
) {
  return requireRole(["ADMIN"], handler);
}

// Generate unique order/project/quote numbers
export async function generateOrderNumber(): Promise<string> {
  const count = await prisma.order.count().catch(() => 0);
  return `JV${(count + 1001).toString()}`;
}

export async function generateProjectNumber(): Promise<string> {
  const count = await prisma.project.count().catch(() => 0);
  return `PRJ-${(count + 1).toString().padStart(3, "0")}`;
}

export async function generateQuoteNumber(): Promise<string> {
  const count = await prisma.quote.count().catch(() => 0);
  return `QT-${(count + 1001).toString()}`;
}
