/*
  Warnings:

  - Made the column `userPackageId` on table `Reservation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_userPackageId_fkey";

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "userPackageId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userPackageId_fkey" FOREIGN KEY ("userPackageId") REFERENCES "UserPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
