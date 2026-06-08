-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "blogId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bookmark_blogId_idx" ON "Bookmark"("blogId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_blogId_key" ON "Bookmark"("userId", "blogId");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
