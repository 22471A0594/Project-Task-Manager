// FORCE ENVIRONMENT VARIABLES IF RAILWAY FAILS TO INJECT THEM
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgres://62cfa1e42b233f2d7d908b5f3aa33c959eafb21ee992328034213b197612c482:sk_UdJCVe9473POz7UDr2ZMw@db.prisma.io:5432/postgres?sslmode=require";
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "projectpilot-super-secret-jwt-key-change-in-production-2024";
}

const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

console.log(`=== STARTING DEPLOYMENT LIFECYCLE ===`);
console.log(`[1] PORT configuration detected: ${PORT}`);
console.log(`[2] DATABASE_URL configuration detected: ${process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'}`);

async function startServer() {
  try {
    console.log('[3] Starting Express Server...');
    // Start Express FIRST so Railway's healthcheck passes quickly, even if DB is slow
    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ [SUCCESS] ProjectPilot API is actively listening on http://${HOST}:${PORT}`);
    });

    console.log('[4] Attempting to connect to Prisma Database...');
    // We intentionally do not use await here if we want to ensure the server starts unconditionally, 
    // but the user wants to know if Prisma crashes. We will await it, but log heavily.
    await prisma.$connect();
    console.log('✅ [SUCCESS] Prisma Database connected successfully');

  } catch (error) {
    console.error('❌ [FATAL] Failed to start server:', error);
    process.exit(1);
  }
}

// Global Error Catchers for silent async crashes
process.on('uncaughtException', (err) => {
  console.error('❌ [CRITICAL] Uncaught Exception detected:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [CRITICAL] Unhandled Promise Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
