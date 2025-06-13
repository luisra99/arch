/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Prospects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Prospects_email_key" ON "Prospects"("email");
