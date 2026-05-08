const { PrismaClient } = require('@prisma/client');

console.log("=== STARTUP VALIDATION ===");
if (process.env.DATABASE_URL) {
  console.log("✅ DATABASE_URL is present.");
}

const prisma = new PrismaClient();

module.exports = prisma;
