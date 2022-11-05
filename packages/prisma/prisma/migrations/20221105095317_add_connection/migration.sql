/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "Connection" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Connection_channelId_key" ON "Connection"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_displayName_key" ON "Connection"("displayName");
