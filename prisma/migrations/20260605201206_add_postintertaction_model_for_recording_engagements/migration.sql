-- CreateTable
CREATE TABLE "BlogPostInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'comments',

    CONSTRAINT "BlogPostInteraction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlogPostInteraction" ADD CONSTRAINT "BlogPostInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostInteraction" ADD CONSTRAINT "BlogPostInteraction_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
