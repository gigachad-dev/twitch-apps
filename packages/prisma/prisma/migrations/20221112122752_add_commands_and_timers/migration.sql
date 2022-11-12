/*
  Warnings:

  - You are about to drop the `Connection` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Userlevel" AS ENUM ('everyone', 'subscriber', 'vip', 'moderator', 'regular', 'broadcaster');

-- CreateEnum
CREATE TYPE "Sendtype" AS ENUM ('say', 'reply', 'action');

-- DropTable
DROP TABLE "Connection";

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT true,
    "channelId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Command" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "message" VARCHAR(500) NOT NULL,
    "userlevel" "Userlevel" NOT NULL DEFAULT 'everyone',
    "sendType" "Sendtype" NOT NULL DEFAULT 'reply',
    "private" BOOLEAN NOT NULL DEFAULT false,
    "cooldown" INTEGER NOT NULL DEFAULT 60,
    "lastCooldownTime" TIMESTAMP(3) NOT NULL,
    "channelId" INTEGER NOT NULL,

    CONSTRAINT "Command_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timer" (
    "id" SERIAL NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 600,
    "commandId" INTEGER NOT NULL,

    CONSTRAINT "Timer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_channelId_key" ON "Channel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_displayName_key" ON "Channel"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Command_name_key" ON "Command"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Timer_commandId_key" ON "Timer"("commandId");

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timer" ADD CONSTRAINT "Timer_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
