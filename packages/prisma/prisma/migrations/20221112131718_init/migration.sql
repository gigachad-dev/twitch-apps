-- CreateEnum
CREATE TYPE "Userlevel" AS ENUM ('everyone', 'subscriber', 'vip', 'moderator', 'regular', 'broadcaster');

-- CreateEnum
CREATE TYPE "Sendtype" AS ENUM ('say', 'reply', 'action');

-- CreateTable
CREATE TABLE "Auth" (
    "id" SERIAL NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "scope" TEXT[],
    "expiresIn" INTEGER,
    "obtainmentTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT true,
    "channelId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextToSpeech" (
    "id" SERIAL NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "voice" TEXT,

    CONSTRAINT "TextToSpeech_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balaboba" (
    "id" SERIAL NOT NULL,
    "tts" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Balaboba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Command" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "message" VARCHAR(500) NOT NULL,
    "userlevel" "Userlevel"[] DEFAULT ARRAY['everyone']::"Userlevel"[],
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
