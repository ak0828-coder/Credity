-- CreateEnum
CREATE TYPE "AssuranceLevel" AS ENUM ('none', 'spid_l2', 'spid_l3', 'cie');

-- AlterTable
ALTER TABLE "ProfileVerified" ADD COLUMN     "assuranceLevel" "AssuranceLevel" NOT NULL DEFAULT 'none';
