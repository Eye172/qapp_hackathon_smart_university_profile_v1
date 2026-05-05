-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Kazakhstan',
    "currentCountry" TEXT NOT NULL DEFAULT 'Kazakhstan',
    "gradeLevel" INTEGER NOT NULL DEFAULT 11,
    "gpa" REAL NOT NULL DEFAULT 0,
    "gpaScale" REAL NOT NULL DEFAULT 5.0,
    "avatarUrl" TEXT,
    "ieltsOverall" REAL,
    "ieltsListening" REAL,
    "ieltsReading" REAL,
    "ieltsWriting" REAL,
    "ieltsSpeaking" REAL,
    "ieltsTakenAt" TEXT,
    "satTotal" INTEGER,
    "satMath" INTEGER,
    "satEbrw" INTEGER,
    "satTakenAt" TEXT,
    "interests" TEXT NOT NULL DEFAULT '[]',
    "preferredCountries" TEXT NOT NULL DEFAULT '[]',
    "preferredStudyLevel" TEXT NOT NULL DEFAULT 'bachelor',
    "budgetUsdPerYear" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudentProfile" ("avatarUrl", "budgetUsdPerYear", "createdAt", "currentCountry", "fullName", "gpa", "gpaScale", "gradeLevel", "id", "ieltsListening", "ieltsOverall", "ieltsReading", "ieltsSpeaking", "ieltsTakenAt", "ieltsWriting", "interests", "nationality", "preferredCountries", "preferredStudyLevel", "satEbrw", "satMath", "satTakenAt", "satTotal", "updatedAt", "userId") SELECT "avatarUrl", "budgetUsdPerYear", "createdAt", "currentCountry", "fullName", "gpa", "gpaScale", "gradeLevel", "id", "ieltsListening", "ieltsOverall", "ieltsReading", "ieltsSpeaking", "ieltsTakenAt", "ieltsWriting", "interests", "nationality", "preferredCountries", "preferredStudyLevel", "satEbrw", "satMath", "satTakenAt", "satTotal", "updatedAt", "userId" FROM "StudentProfile";
DROP TABLE "StudentProfile";
ALTER TABLE "new_StudentProfile" RENAME TO "StudentProfile";
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
