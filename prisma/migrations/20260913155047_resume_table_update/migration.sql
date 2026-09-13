/*
  Warnings:

  - Added the required column `cloudinary_id` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resume_text` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "cloudinary_id" TEXT NOT NULL,
ADD COLUMN     "resume_text" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
