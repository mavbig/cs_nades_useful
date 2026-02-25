-- CreateTable
CREATE TABLE "Lineup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "map" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "utility" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT NOT NULL,
    "startSpot" TEXT NOT NULL,
    "aimSpot" TEXT NOT NULL,
    "throwType" TEXT NOT NULL,
    "tickrate" TEXT NOT NULL,
    "screenshotPath" TEXT NOT NULL,
    "clipPath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Lineup_map_idx" ON "Lineup"("map");
