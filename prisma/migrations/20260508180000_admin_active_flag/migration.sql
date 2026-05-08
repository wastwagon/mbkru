-- Allow disabling admin accounts without deleting rows (multi-operator access).
ALTER TABLE "Admin" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
