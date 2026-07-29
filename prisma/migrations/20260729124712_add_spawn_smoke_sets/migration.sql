-- CreateTable
CREATE TABLE "SpawnSmokeSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "map" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SpawnSmokePosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "screenshotPath" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "SpawnSmokePosition_setId_fkey" FOREIGN KEY ("setId") REFERENCES "SpawnSmokeSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SpawnSmokeSet_map_idx" ON "SpawnSmokeSet"("map");

-- CreateIndex
CREATE INDEX "SpawnSmokePosition_setId_idx" ON "SpawnSmokePosition"("setId");
