-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "field" TEXT,
    "degree" TEXT,
    "duration" INTEGER,
    "language" TEXT,
    "tuitionPerYear" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Program_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "covers" TEXT,
    "eligibility" TEXT,
    "minGpa" REAL,
    "minIelts" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scholarship_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universityId" TEXT NOT NULL,
    "label" TEXT,
    "date" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deadline_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_University" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameRu" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "founded" INTEGER,
    "type" TEXT,
    "languages" TEXT,
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "campusPhoto" TEXT,
    "websiteUrl" TEXT,
    "contactEmail" TEXT,
    "worldRank" INTEGER,
    "minGpa" REAL,
    "minIelts" REAL,
    "minSat" INTEGER,
    "applicationDeadline" TEXT,
    "description" TEXT,
    "fitScore" INTEGER NOT NULL DEFAULT 70,
    "recommendationScore" REAL NOT NULL DEFAULT 0,
    "fitScoreBreakdown" TEXT,
    "programs" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_University" ("city", "country", "createdAt", "fitScore", "fitScoreBreakdown", "heroImageUrl", "id", "logoUrl", "name", "programs", "tags", "updatedAt", "worldRank") SELECT "city", "country", "createdAt", "fitScore", "fitScoreBreakdown", "heroImageUrl", "id", "logoUrl", "name", "programs", "tags", "updatedAt", "worldRank" FROM "University";
DROP TABLE "University";
ALTER TABLE "new_University" RENAME TO "University";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Program_universityId_idx" ON "Program"("universityId");

-- CreateIndex
CREATE INDEX "Scholarship_universityId_idx" ON "Scholarship"("universityId");

-- CreateIndex
CREATE INDEX "Deadline_universityId_idx" ON "Deadline"("universityId");
