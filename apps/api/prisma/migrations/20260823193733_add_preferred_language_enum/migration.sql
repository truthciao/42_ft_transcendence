/*
  Warnings:

  - The `preferredLanguage` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PreferredLanguage" AS ENUM ('en', 'fr', 'zh');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "preferredLanguage",
ADD COLUMN     "preferredLanguage" "PreferredLanguage";
