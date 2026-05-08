const { PrismaClient } = require('@prisma/client');

console.log("=== STARTUP VALIDATION ===");
if (!process.env.DATABASE_URL) {
  console.error("❌ CRITICAL ERROR: DATABASE_URL environment variable is missing.");
  console.error("👉 Railway Deployment Fix:");
  console.error("   1. Go to your Railway Project Dashboard");
  console.error("   2. Click on the 'Project-Task-Manager' service");
  console.error("   3. Go to the 'Variables' tab");
  console.error("   4. Make sure 'DATABASE_URL' is added and spelled perfectly.");
  console.error("   5. Make sure you are adding it to the correct Environment (e.g. 'production').");
  console.error("   6. Click the purple 'Deploy' button if it asks you to save unsaved changes.");
  process.exit(1); // Exit early so Prisma doesn't crash cryptically
} else {
  console.log("✅ DATABASE_URL is present.");
}

const prisma = new PrismaClient();

module.exports = prisma;
