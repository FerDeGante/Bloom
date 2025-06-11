-- Drop the old foreign key if exist
-- ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS "Reservation_userPackageId_fkey";

-- Add the column userPackageId (nullable por defecto, porque lo pusimos como String?)
ALTER TABLE "Reservation" ADD COLUMN     "userPackageId" text;

-- Create index on userPackageId
CREATE INDEX "Reservation_userPackageId_index" ON "Reservation"("userPackageId");

-- Add foreign key constraint (pero debemos permitirlo porque es nullable)
ALTER TABLE "Reservation" 
ADD CONSTRAINT "Reservation_userPackageId_fkey" 
FOREIGN KEY ("userPackageId") REFERENCES "UserPackage"(id) ON DELETE SET NULL;
