-- AlterTable — longer OSM display_name / structured address lines for Voice intake
ALTER TABLE "CitizenReport" ALTER COLUMN "localArea" SET DATA TYPE VARCHAR(512);
