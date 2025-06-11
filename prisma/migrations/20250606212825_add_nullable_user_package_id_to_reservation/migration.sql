-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_userPackageId_fkey";

-- DropIndex
DROP INDEX "Reservation_date_idx";

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userPackageId_fkey" FOREIGN KEY ("userPackageId") REFERENCES "UserPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Reservation_userPackageId_index" RENAME TO "Reservation_userPackageId_idx";
