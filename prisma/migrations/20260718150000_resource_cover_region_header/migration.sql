-- Resource covers and regional establishing header photos

ALTER TABLE "ResourceDocument" ADD COLUMN "coverMediaId" TEXT;

ALTER TABLE "ResourceDocument"
  ADD CONSTRAINT "ResourceDocument_coverMediaId_fkey"
  FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Region" ADD COLUMN "headerMediaId" TEXT;

ALTER TABLE "Region"
  ADD CONSTRAINT "Region_headerMediaId_fkey"
  FOREIGN KEY ("headerMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
