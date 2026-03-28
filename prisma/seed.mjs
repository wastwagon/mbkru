/**
 * DB seed — runs in production Docker without tsx (`node prisma/seed.mjs`).
 * @see package.json prisma.seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const REGIONS_SEED = [
  { name: "Greater Accra", slug: "greater-accra" },
  { name: "Ashanti", slug: "ashanti" },
  { name: "Northern", slug: "northern" },
  { name: "Western", slug: "western" },
  { name: "Eastern", slug: "eastern" },
  { name: "Volta", slug: "volta" },
  { name: "Upper East", slug: "upper-east" },
  { name: "Upper West", slug: "upper-west" },
  { name: "Central", slug: "central" },
  { name: "Bono", slug: "bono" },
  { name: "Bono East", slug: "bono-east" },
  { name: "Ahafo", slug: "ahafo" },
  { name: "Oti", slug: "oti" },
  { name: "Western North", slug: "western-north" },
  { name: "North East", slug: "north-east" },
  { name: "Savannah", slug: "savannah" },
];

async function main() {
  for (let i = 0; i < REGIONS_SEED.length; i++) {
    const r = REGIONS_SEED[i];
    await prisma.region.upsert({
      where: { slug: r.slug },
      create: { name: r.name, slug: r.slug, sortOrder: i },
      update: { name: r.name, sortOrder: i },
    });
  }
  console.log("Regions seeded:", REGIONS_SEED.length);

  const email = process.env.ADMIN_EMAIL;
  const plain = process.env.ADMIN_PASSWORD;
  if (!email || !plain) {
    console.warn("Skip admin: set ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin.");
    return;
  }
  const password = await bcrypt.hash(plain, 12);
  await prisma.admin.upsert({
    where: { email },
    create: { email, password },
    update: { password },
  });
  console.log("Admin ready:", email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
