/*
  Warnings:

  - The `summary` column on the `BlogSummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BlogSummary" DROP COLUMN "summary",
ADD COLUMN     "summary" JSONB NOT NULL DEFAULT '[]';
