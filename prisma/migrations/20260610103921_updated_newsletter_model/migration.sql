/*
  Warnings:

  - You are about to drop the `NewLetter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NewLetter" DROP CONSTRAINT "NewLetter_userId_fkey";

-- DropTable
DROP TABLE "NewLetter";

-- CreateTable
CREATE TABLE "NewsLetter" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsLetter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsLetter_id_key" ON "NewsLetter"("id");

-- AddForeignKey
ALTER TABLE "NewsLetter" ADD CONSTRAINT "NewsLetter_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsLetter" ADD CONSTRAINT "NewsLetter_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
