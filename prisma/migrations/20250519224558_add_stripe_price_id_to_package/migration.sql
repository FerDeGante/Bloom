/*
  Warnings:

  - A unique constraint covering the columns `[stripePriceId]` on the table `Package` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripePriceId` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "stripePriceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Package_stripePriceId_key" ON "Package"("stripePriceId");
