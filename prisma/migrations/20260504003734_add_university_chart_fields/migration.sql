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
    "photosJson" TEXT NOT NULL DEFAULT '[]',
    "statsTestScores" TEXT,
    "statsDemographics" TEXT,
    "statsFinancials" TEXT,
    "statsTopMajors" TEXT,
    "extendedProfile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_University" ("applicationDeadline", "campusPhoto", "city", "contactEmail", "country", "createdAt", "description", "fitScore", "fitScoreBreakdown", "founded", "heroImageUrl", "id", "languages", "logoUrl", "minGpa", "minIelts", "minSat", "name", "nameRu", "programs", "recommendationScore", "tags", "type", "updatedAt", "websiteUrl", "worldRank") SELECT "applicationDeadline", "campusPhoto", "city", "contactEmail", "country", "createdAt", "description", "fitScore", "fitScoreBreakdown", "founded", "heroImageUrl", "id", "languages", "logoUrl", "minGpa", "minIelts", "minSat", "name", "nameRu", "programs", "recommendationScore", "tags", "type", "updatedAt", "websiteUrl", "worldRank" FROM "University";
DROP TABLE "University";
ALTER TABLE "new_University" RENAME TO "University";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
