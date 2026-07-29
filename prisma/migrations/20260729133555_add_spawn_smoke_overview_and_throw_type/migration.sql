-- AlterTable
ALTER TABLE "SpawnSmokeSet" ADD COLUMN "overviewImagePath" TEXT;
ALTER TABLE "SpawnSmokeSet" ADD COLUMN "thumbnailPath" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpawnSmokePosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "throwType" TEXT NOT NULL DEFAULT 'STAND',
    "screenshotPath" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "SpawnSmokePosition_setId_fkey" FOREIGN KEY ("setId") REFERENCES "SpawnSmokeSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SpawnSmokePosition" ("description", "id", "label", "screenshotPath", "setId", "sortOrder") SELECT "description", "id", "label", "screenshotPath", "setId", "sortOrder" FROM "SpawnSmokePosition";
DROP TABLE "SpawnSmokePosition";
ALTER TABLE "new_SpawnSmokePosition" RENAME TO "SpawnSmokePosition";
CREATE INDEX "SpawnSmokePosition_setId_idx" ON "SpawnSmokePosition"("setId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
