-- CreateTable
CREATE TABLE "BlogSummary" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogSummary_blogId_key" ON "BlogSummary"("blogId");

-- AddForeignKey
ALTER TABLE "BlogSummary" ADD CONSTRAINT "BlogSummary_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
