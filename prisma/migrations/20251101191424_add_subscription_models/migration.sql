/*
  Warnings:

  - You are about to drop the column `stripePriceId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `limit` on the `UsageTracking` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `UsageTracking` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,feature,month]` on the table `UsageTracking` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `month` on the `UsageTracking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropIndex
DROP INDEX "Subscription_status_idx";

-- DropIndex
DROP INDEX "UsageTracking_userId_feature_month_year_key";

-- DropIndex
DROP INDEX "UsageTracking_userId_month_year_idx";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripePriceId",
ADD COLUMN     "stripeCustomerId" TEXT,
ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL,
ALTER COLUMN "tier" SET DEFAULT 'Free',
ALTER COLUMN "status" SET DEFAULT 'active',
ALTER COLUMN "currentPeriodStart" DROP NOT NULL,
ALTER COLUMN "currentPeriodEnd" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UsageTracking" DROP COLUMN "limit",
DROP COLUMN "year",
DROP COLUMN "month",
ADD COLUMN     "month" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Payment";

-- CreateIndex
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "UsageTracking_month_idx" ON "UsageTracking"("month");

-- CreateIndex
CREATE INDEX "UsageTracking_feature_idx" ON "UsageTracking"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "UsageTracking_userId_feature_month_key" ON "UsageTracking"("userId", "feature", "month");
