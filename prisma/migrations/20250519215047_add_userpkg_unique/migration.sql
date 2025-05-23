/*
  Warnings:

  - A unique constraint covering the columns `[userId,pkgId]` on the table `UserPackage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserPackage_userId_pkgId_key" ON "UserPackage"("userId", "pkgId");
