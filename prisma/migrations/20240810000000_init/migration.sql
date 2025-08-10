-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('FIZICA', 'JURIDICA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "personType" "PersonType" NOT NULL DEFAULT 'FIZICA',
    "phone" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "cnp" TEXT,
    "companyName" TEXT,
    "cui" TEXT,
    "regCom" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'România',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
