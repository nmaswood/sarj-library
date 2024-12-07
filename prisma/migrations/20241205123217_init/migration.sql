/*
  Warnings:

  - You are about to drop the column `plotSummaryId` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `plotSummaryId` on the `sentimentanalysis` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `character` DROP FOREIGN KEY `Character_plotSummaryId_fkey`;

-- DropForeignKey
ALTER TABLE `sentimentanalysis` DROP FOREIGN KEY `SentimentAnalysis_plotSummaryId_fkey`;

-- AlterTable
ALTER TABLE `character` DROP COLUMN `plotSummaryId`;

-- AlterTable
ALTER TABLE `sentimentanalysis` DROP COLUMN `plotSummaryId`;
