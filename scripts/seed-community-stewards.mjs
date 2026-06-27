#!/usr/bin/env node
/**
 * Provision default community steward accounts without a full prisma seed pass.
 * Usage: npm run db:seed:community-stewards
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { seedCommunityStewards } from "../prisma/lib/seed-community-stewards.mjs";

const prisma = new PrismaClient();

async function main() {
  const stats = await seedCommunityStewards(prisma, bcrypt);
  console.log("Community steward seed finished.", stats);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
