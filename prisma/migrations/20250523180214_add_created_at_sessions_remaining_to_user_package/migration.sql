/*
  Warnings:

  - Added the required column `sessionsRemaining` to the `UserPackage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPackage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sessionsRemaining" INTEGER NOT NULL;
