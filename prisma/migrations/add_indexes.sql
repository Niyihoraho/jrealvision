-- ==============================================================================
-- JREAL VISION DESIGN - Production B-Tree Performance Indexes
-- ==============================================================================

-- 1. Products Table (Catalog filtering by category, active status, featured, and date)
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products"("category");
CREATE INDEX IF NOT EXISTS "products_active_idx" ON "products"("active");
CREATE INDEX IF NOT EXISTS "products_featured_idx" ON "products"("featured");
CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "products"("created_at");
CREATE INDEX IF NOT EXISTS "products_category_active_idx" ON "products"("category", "active");

-- 2. Services Table (Service offerings by category and active status)
CREATE INDEX IF NOT EXISTS "services_category_idx" ON "services"("category");
CREATE INDEX IF NOT EXISTS "services_active_idx" ON "services"("active");

-- 3. Orders Table (Customer order history and status tracking)
CREATE INDEX IF NOT EXISTS "orders_customer_id_idx" ON "orders"("customer_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders"("created_at");

-- 4. Order Items Table (Fast order-product joins)
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX IF NOT EXISTS "order_items_product_id_idx" ON "order_items"("product_id");

-- 5. Artworks Table (Artist gallery lookups and status filtering)
CREATE INDEX IF NOT EXISTS "artworks_artist_id_idx" ON "artworks"("artist_id");
CREATE INDEX IF NOT EXISTS "artworks_status_idx" ON "artworks"("status");
CREATE INDEX IF NOT EXISTS "artworks_created_at_idx" ON "artworks"("created_at");
