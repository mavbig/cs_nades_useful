/*
  Warnings:

  - You are about to drop the column `aimSpot` on the `Lineup` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lineup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "map" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "utility" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT NOT NULL,
    "startSpot" TEXT NOT NULL,
    "throwType" TEXT NOT NULL,
    "tickrate" TEXT NOT NULL,
    "screenshotPath" TEXT NOT NULL,
    "clipPath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Lineup" ("clipPath", "createdAt", "description", "id", "map", "screenshotPath", "side", "startSpot", "tags", "throwType", "tickrate", "title", "updatedAt", "utility") SELECT "clipPath", "createdAt", "description", "id", "map", "screenshotPath", "side", "startSpot", "tags", "throwType", "tickrate", "title", "updatedAt", "utility" FROM "Lineup";
DROP TABLE "Lineup";
ALTER TABLE "new_Lineup" RENAME TO "Lineup";
CREATE INDEX "Lineup_map_idx" ON "Lineup"("map");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
