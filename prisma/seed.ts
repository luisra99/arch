import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { logger } from "../src/utils/logger";
const prisma = new PrismaClient();

async function main() {
  const hashedRootPassword = await bcrypt.hash("root", 10);
  const hashedGuestPassword = await bcrypt.hash("guest", 10);

  await prisma.user.create({
    data: {
      username: "root",
      password: hashedRootPassword,
      idRole: "ADMIN",
    },
  });
  await prisma.user.create({
    data: {
      username: "root",
      password: hashedGuestPassword,
      idRole: "GUEST",
    },
  });

  logger.info("Seeded initial data successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
