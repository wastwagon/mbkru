import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const plain = process.env.ADMIN_PASSWORD;
  if (!email || !plain) {
    console.warn("Skip seed: set ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin.");
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
