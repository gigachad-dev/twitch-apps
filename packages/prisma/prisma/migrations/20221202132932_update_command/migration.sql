-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "description" VARCHAR(128),
ALTER COLUMN "message" DROP NOT NULL;
