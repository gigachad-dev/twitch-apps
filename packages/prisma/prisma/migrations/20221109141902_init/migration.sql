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
CREATE TABLE "Connection" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextToSpeech" (
    "id" SERIAL NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "voice" TEXT NOT NULL,

    CONSTRAINT "TextToSpeech_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balaboba" (
    "id" SERIAL NOT NULL,
    "tts" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Balaboba_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Connection_channelId_key" ON "Connection"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_displayName_key" ON "Connection"("displayName");
