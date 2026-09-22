-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "creatorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "senderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
