import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const password = await bcrypt.hash("Demo@123", 10);

  const users = [
    {
      name: "Admin User",
      email: "admin@demo.com",
      password,
      role: Role.ADMIN,
    },
    {
      name: "Sales User",
      email: "sales@demo.com",
      password,
      role: Role.SALES,
    },
    {
      name: "Warehouse User",
      email: "warehouse@demo.com",
      password,
      role: Role.WAREHOUSE,
    },
    {
      name: "Accounts User",
      email: "accounts@demo.com",
      password,
      role: Role.ACCOUNTS,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },

      update: {},

      create: user,
    });
  }

  console.log("Demo users created successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });