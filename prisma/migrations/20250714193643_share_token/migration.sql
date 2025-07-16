-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('FILE', 'FOLDER');

-- CreateTable
CREATE TABLE "ShareToken" (
    "id" TEXT NOT NULL,
    "type" "ShareType" NOT NULL,
    "path" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShareToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareToken_token_key" ON "ShareToken"("token");

-- CreateIndex
CREATE INDEX "ShareToken_token_idx" ON "ShareToken"("token");
