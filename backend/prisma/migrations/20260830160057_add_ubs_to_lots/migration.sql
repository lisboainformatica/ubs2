/*
  Warnings:

  - Added the required column `ubsId` to the `MedicationLot` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MedicationLot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ubsId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "quantityPhysical" INTEGER NOT NULL,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "quantityAvailable" INTEGER NOT NULL,
    "expirationDate" DATETIME NOT NULL,
    "manufacturingDate" DATETIME,
    "supplier" TEXT,
    CONSTRAINT "MedicationLot_ubsId_fkey" FOREIGN KEY ("ubsId") REFERENCES "UBS" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MedicationLot_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MedicationLot" ("expirationDate", "id", "lotNumber", "manufacturingDate", "medicationId", "quantityAvailable", "quantityPhysical", "quantityReserved", "supplier") SELECT "expirationDate", "id", "lotNumber", "manufacturingDate", "medicationId", "quantityAvailable", "quantityPhysical", "quantityReserved", "supplier" FROM "MedicationLot";
DROP TABLE "MedicationLot";
ALTER TABLE "new_MedicationLot" RENAME TO "MedicationLot";
CREATE UNIQUE INDEX "MedicationLot_ubsId_medicationId_lotNumber_key" ON "MedicationLot"("ubsId", "medicationId", "lotNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
