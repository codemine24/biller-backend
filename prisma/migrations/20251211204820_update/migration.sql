/*
  Warnings:

  - You are about to drop the column `location` on the `stores` table. All the data in the column will be lost.
  - Added the required column `address` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "location",
ADD COLUMN     "address" TEXT NOT NULL;
