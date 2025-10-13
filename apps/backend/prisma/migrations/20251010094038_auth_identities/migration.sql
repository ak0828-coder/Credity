-- CreateEnum
CREATE TYPE "IdentityProvider" AS ENUM ('PASSWORD', 'SPID', 'CIE');

-- CreateTable
CREATE TABLE "ProfileVerified" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "ProfileVerified_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Identity" (
    "id" TEXT NOT NULL,
    "provider" "IdentityProvider" NOT NULL,
    "subject" TEXT NOT NULL,
    "passwordHash" TEXT,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileVerified_email_key" ON "ProfileVerified"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Identity_provider_subject_key" ON "Identity"("provider", "subject");

-- AddForeignKey
ALTER TABLE "Identity" ADD CONSTRAINT "Identity_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProfileVerified"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
