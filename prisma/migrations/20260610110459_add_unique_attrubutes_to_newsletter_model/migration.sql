/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,subscriberId]` on the table `NewsLetter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "NewsLetter_ownerId_subscriberId_idx" ON "NewsLetter"("ownerId", "subscriberId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsLetter_ownerId_subscriberId_key" ON "NewsLetter"("ownerId", "subscriberId");

-- CreateIndex
CREATE INDEX "Notification_userId_event_idx" ON "Notification"("userId", "event");
