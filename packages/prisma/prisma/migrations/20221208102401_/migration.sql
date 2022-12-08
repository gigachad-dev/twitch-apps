-- CreateEnum
CREATE TYPE "Userlevel" AS ENUM ('everyone', 'follower', 'subscriber', 'vip', 'moderator', 'owner');

-- CreateEnum
CREATE TYPE "Sendtype" AS ENUM ('say', 'reply', 'action');

-- CreateEnum
CREATE TYPE "CommandType" AS ENUM ('custom', 'embedded');

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
    "description" VARCHAR(64),
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "userlevel" "Userlevel"[] DEFAULT ARRAY['everyone']::"Userlevel"[],
    "sendType" "Sendtype" NOT NULL DEFAULT 'reply',
    "commandType" "CommandType" NOT NULL DEFAULT 'custom',
    "responses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cooldown" INTEGER NOT NULL DEFAULT 60,
    "lastCooldownTime" TIMESTAMP(3),
    "ignoreCooldown" "Userlevel"[] DEFAULT ARRAY['owner']::"Userlevel"[],

    CONSTRAINT "Command_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Command_name_key" ON "Command"("name");
