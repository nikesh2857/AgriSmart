-- CreateEnum
CREATE TYPE "AiHistoryType" AS ENUM ('CHAT', 'VISION', 'VIDEO', 'SEARCH', 'IMAGE_GEN');

-- CreateTable
CREATE TABLE "AiHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AiHistoryType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "responseSummary" TEXT NOT NULL,
    "fileUrl" TEXT,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiHistory" ADD CONSTRAINT "AiHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
