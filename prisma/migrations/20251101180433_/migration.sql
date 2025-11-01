/*
  Warnings:

  - A unique constraint covering the columns `[userId,title]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Resume_userId_key";

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_title_key" ON "Resume"("userId", "title");
