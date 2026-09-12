/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `Resume` table. All the data in the column will be lost.
  - Added the required column `file_name` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "createdAt",
DROP COLUMN "filename",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "file_name" TEXT NOT NULL;
