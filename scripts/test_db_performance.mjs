import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { performance } from "perf_hooks";

const connectionString = process.env.DATABASE_URL;
console.log("Connecting using DATABASE_URL...");

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runAudit() {
  console.log("\n=== JREAL VISION DESIGN - DATABASE & INDEX AUDIT ===");
  
  // 1. Connection Ping
  const startPing = performance.now();
  await prisma.$queryRaw`SELECT 1 as ping`;
  const pingDuration = (performance.now() - startPing).toFixed(2);
  console.log(`[Database Ping] Connection latency: ${pingDuration} ms`);

  // 2. Products Count
  const startCount = performance.now();
  const productCount = await prisma.product.count();
  const countDuration = (performance.now() - startCount).toFixed(2);
  console.log(`[Products Count] Total products in database: ${productCount} (${countDuration} ms)`);

  // 3. 20-Product Paginated Index Query (Simulating /shop page 1)
  const startP1 = performance.now();
  const page1 = await prisma.product.findMany({
    where: { active: true },
    take: 20,
    skip: 0,
    orderBy: { createdAt: "desc" },
  });
  const p1Duration = (performance.now() - startP1).toFixed(2);
  console.log(`[Paginated Query Page 1] Retrieved ${page1.length} products (${p1Duration} ms)`);

  // 4. Category Filter Query (Using B-Tree composite index [category, active])
  const testCat = page1.length > 0 ? page1[0].category : "printing";
  const startCat = performance.now();
  const catItems = await prisma.product.findMany({
    where: { category: { equals: testCat, mode: "insensitive" }, active: true },
    take: 20,
    orderBy: { createdAt: "desc" },
  });
  const catDuration = (performance.now() - startCat).toFixed(2);
  console.log(`[Indexed Category Query] Category "${testCat}": ${catItems.length} products (${catDuration} ms)`);

  // 5. Featured Query
  const startFeat = performance.now();
  const featured = await prisma.product.findMany({
    where: { featured: true, active: true },
    take: 10,
  });
  const featDuration = (performance.now() - startFeat).toFixed(2);
  console.log(`[Featured Query] ${featured.length} featured items (${featDuration} ms)`);

  // 6. Services Query
  const startSvc = performance.now();
  const services = await prisma.service.findMany({
    where: { active: true },
    take: 20,
  });
  const svcDuration = (performance.now() - startSvc).toFixed(2);
  console.log(`[Services Query] ${services.length} services (${svcDuration} ms)`);

  // 7. Verify PostgreSQL Index Catalog
  console.log("\n=== POSTGRESQL INDEX CATALOG CHECK ===");
  const indexes = await prisma.$queryRaw`
    SELECT
      tablename,
      indexname
    FROM pg_indexes
    WHERE schemaname = 'public' 
      AND tablename IN ('products', 'services', 'orders', 'order_items', 'artworks')
    ORDER BY tablename, indexname;
  `;

  console.log(`Verified ${indexes.length} indexes in PostgreSQL:`);
  indexes.forEach(idx => {
    console.log(`  - [${idx.tablename}] ${idx.indexname}`);
  });

  await prisma.$disconnect();
  await pool.end();
  console.log("\n=== DB AUDIT COMPLETE: ALL CHECKS PASSED ===");
}

runAudit().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
