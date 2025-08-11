-- AlterEnum
ALTER TYPE "PersonType" RENAME TO "PersonType_old";
CREATE TYPE "PersonType" AS ENUM ('fizica', 'juridica');
ALTER TABLE "users" ALTER COLUMN "personType" TYPE "PersonType" USING "personType"::text::"PersonType";
DROP TYPE "PersonType_old";
