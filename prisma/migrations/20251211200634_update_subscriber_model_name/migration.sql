/*
  Warnings:

  - You are about to drop the column `subscriber_id` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `subscriber_id` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `subscriber_id` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `subscriber_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `subscriber_id` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `subscriber_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscriber_id` on the `vendors` table. All the data in the column will be lost.
  - You are about to drop the `subscribers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `company_id` to the `brands` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `vendors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'HOLD');

-- DropForeignKey
ALTER TABLE "brands" DROP CONSTRAINT "brands_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "vendors" DROP CONSTRAINT "vendors_subscriber_id_fkey";

-- AlterTable
ALTER TABLE "brands" DROP COLUMN "subscriber_id",
ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "subscriber_id",
ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "subscriber_id",
ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "subscriber_id",
ADD COLUMN     "company_id" TEXT;

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "subscriber_id",
ADD COLUMN     "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "subscriber_id",
ADD COLUMN     "company_id" TEXT,
ALTER COLUMN "role" SET DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "vendors" DROP COLUMN "subscriber_id",
ADD COLUMN     "company_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "subscribers";

-- DropEnum
DROP TYPE "SubscriberStatus";

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "contact_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "CompanyStatus" NOT NULL DEFAULT 'HOLD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_contact_number_key" ON "companies"("contact_number");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
