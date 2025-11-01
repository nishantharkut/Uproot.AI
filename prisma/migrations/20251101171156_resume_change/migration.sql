/*
  Warnings:

  - You are about to drop the column `atsScore` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `Resume` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[publicLinkId]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicLinkId` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "atsScore",
DROP COLUMN "content",
DROP COLUMN "feedback",
ADD COLUMN     "currentVersionId" TEXT,
ADD COLUMN     "publicLinkId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ResumeVersion" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "cloudinaryUrl" TEXT,
    "fileName" TEXT,
    "atsScore" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResumeVersion_resumeId_idx" ON "ResumeVersion"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeVersion_isCurrent_idx" ON "ResumeVersion"("isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeVersion_resumeId_versionNumber_key" ON "ResumeVersion"("resumeId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_publicLinkId_key" ON "Resume"("publicLinkId");

-- AddForeignKey
ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
