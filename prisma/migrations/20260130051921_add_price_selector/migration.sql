-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "price_entries" (
    "id" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "contributorId" TEXT NOT NULL,

    CONSTRAINT "price_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vec_items" (
    "id" TEXT NOT NULL,
    "embedding" vector(1536),

    CONSTRAINT "vec_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "query" TEXT NOT NULL,
    "price_result" DOUBLE PRECISION,
    "deep_search" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "response_time" INTEGER,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trusted_sources" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price_selector" TEXT,

    CONSTRAINT "trusted_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reported_urls" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "query" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "reported_urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklist_rules" (
    "id" SERIAL NOT NULL,
    "pattern" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "blacklist_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_entries_timestamp_idx" ON "price_entries"("timestamp");

-- CreateIndex
CREATE INDEX "price_entries_item_idx" ON "price_entries"("item");

-- CreateIndex
CREATE INDEX "logs_timestamp_idx" ON "logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "trusted_sources_url_key" ON "trusted_sources"("url");

-- CreateIndex
CREATE INDEX "trusted_sources_category_idx" ON "trusted_sources"("category");

-- CreateIndex
CREATE INDEX "reported_urls_timestamp_idx" ON "reported_urls"("timestamp");
