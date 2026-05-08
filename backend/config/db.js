const { PrismaClient } = require('@prisma/client');

console.log("=== DEBUG ENVIRONMENT VARIABLES ===");
console.log("DATABASE_URL is defined:", !!process.env.DATABASE_URL);
console.log("PORT is defined:", !!process.env.PORT);

// Optionally pass it directly to be absolutely sure Prisma sees it
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

module.exports = prisma;
