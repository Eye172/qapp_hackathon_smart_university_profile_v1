-- CreateTable
CREATE TABLE "UserPreferenceCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPreferenceCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreferenceValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPreferenceValue_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "UserPreferenceCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserPreferenceCategory_userId_idx" ON "UserPreferenceCategory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferenceCategory_userId_categoryKey_key" ON "UserPreferenceCategory"("userId", "categoryKey");
