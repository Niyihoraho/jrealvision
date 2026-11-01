// JREAL VISION DESIGN — Prisma Client Singleton
// Gracefully initializes Prisma Client when database is connected,
// with safe fallback when running locally without active DB credentials.

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
    let clientOptions: any = {};

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
        clientOptions = { adapter };
      } catch (adapterErr) {
        console.warn("Could not initialize @prisma/adapter-pg:", adapterErr);
      }
    }

    prismaClient = new PrismaClient(clientOptions);
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaClient;
    }
  }
} catch (e) {
  // Safe proxy fallback when Prisma client is not yet generated
  // This prevents Next.js from throwing 500 Internal Server Error
  prismaClient = new Proxy(
    {},
    {
      get: (_target, prop) => {
        return new Proxy(
          {},
          {
            get: () => async () => {
              console.warn(
                `Prisma is not yet connected to a database. Please configure DATABASE_URL in .env.local and run npx prisma db push`
              );
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
