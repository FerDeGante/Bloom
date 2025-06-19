/*
  Warnings:

  - You are about to drop the column `name` on the `Therapist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Therapist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Therapist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_userPackageId_fkey";

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "userPackageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Therapist" DROP COLUMN "name",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_userId_key" ON "Therapist"("userId");

-- AddForeignKey
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userPackageId_fkey" FOREIGN KEY ("userPackageId") REFERENCES "UserPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
