// JREAL VISION DESIGN — Prisma Client Singleton
// Gracefully initializes Prisma Client when database is connected,
// with safe fallback when running locally without active DB credentials.

// eslint-disable-next-line @typescript-eslint/no-require-imports
try { require("dotenv").config(); } catch {}

let prismaClient: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = globalThis as unknown as {
    prisma: any;
  };

  if (globalForPrisma.prisma) {
    prismaClient = globalForPrisma.prisma;
  } else {
    const connectionString = process.env.DATABASE_URL;

    if (connectionString) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaPg } = require("@prisma/adapter-pg");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Pool } = require("pg");
        const pool = new Pool({ 
          connectionString,
          ssl: { rejectUnauthorized: false },
        });
        const adapter = new PrismaPg(pool);
        prismaClient = new PrismaClient({ adapter });

        if (process.env.NODE_ENV !== "production") {
          globalForPrisma.prisma = prismaClient;
        }
      } catch (adapterErr) {
        console.warn("Could not initialize @prisma/adapter-pg:", adapterErr);
      }
    }
  }
} catch (e: any) {
  console.error("CRITICAL LIB PRISMA INIT ERROR:", e?.message);
}

// Fallback proxy if Prisma client failed to initialize or DB is not configured
if (!prismaClient) {
  prismaClient = new Proxy(
    {},
    {
      get: (_target, prop) => {
        return new Proxy(
          {},
          {
            get: (_model, method) => async (args: any) => {
              console.warn(
                `Prisma fallback executed for: ${String(prop)}.${String(method)}`
              );
              if (method === "findMany") return [];
              if (method === "create" || method === "upsert") {
                return { id: args?.data?.id || `fallback-${Date.now()}`, ...(args?.data || {}) };
              }
              if (method === "update") {
                return { id: args?.where?.id || `fallback-${Date.now()}`, ...(args?.data || {}) };
              }
              if (method === "count") return 0;
              return null;
            },
          }
        );
      },
    }
  );
}

export const prisma = prismaClient;
export default prisma;
