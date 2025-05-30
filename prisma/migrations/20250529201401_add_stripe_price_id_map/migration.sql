/*
  Warnings:

  - You are about to drop the column `stripePriceId` on the `Package` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripe_price_id]` on the table `Package` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripe_price_id` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Package_stripePriceId_key";

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "stripePriceId",
ADD COLUMN     "stripe_price_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Package_stripe_price_id_key" ON "Package"("stripe_price_id");
