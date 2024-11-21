/*
  Warnings:

  - You are about to drop the column `size` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `folders` table. All the data in the column will be lost.
  - Added the required column `bytes` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" DROP COLUMN "size",
ADD COLUMN     "bytes" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "folders" DROP COLUMN "size",
ADD COLUMN     "bytes" INTEGER NOT NULL DEFAULT 0;
