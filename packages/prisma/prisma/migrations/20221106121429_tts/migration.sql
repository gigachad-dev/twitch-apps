-- CreateTable
CREATE TABLE "TextToSpeech" (
    "id" SERIAL NOT NULL,
    "volume" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "voice" TEXT NOT NULL,

    CONSTRAINT "TextToSpeech_pkey" PRIMARY KEY ("id")
);
