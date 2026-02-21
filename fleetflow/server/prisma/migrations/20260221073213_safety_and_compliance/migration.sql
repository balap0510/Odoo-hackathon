-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'WARNING');

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'COMPLIANT',
ADD COLUMN     "suspensionReason" TEXT;
