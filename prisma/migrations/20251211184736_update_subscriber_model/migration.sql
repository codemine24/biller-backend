/*
  Warnings:

  - A unique constraint covering the columns `[contact_number]` on the table `subscribers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contact_number` to the `subscribers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscribers" ADD COLUMN     "contact_number" TEXT NOT NULL,
ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_contact_number_key" ON "subscribers"("contact_number");
