/*
  Warnings:

  - Added the required column `ai_response` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN     "ai_response" JSONB NOT NULL;
