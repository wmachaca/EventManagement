/*
  Warnings:

  - You are about to drop the column `createdAt` on the `EventApplication` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `EventApplication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventApplication" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" INTEGER;

-- CreateIndex
CREATE INDEX "EventApplication_status_idx" ON "EventApplication"("status");

-- CreateIndex
CREATE INDEX "EventApplication_userId_idx" ON "EventApplication"("userId");

-- AddForeignKey
ALTER TABLE "EventApplication" ADD CONSTRAINT "EventApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
