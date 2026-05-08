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

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 ProjectPilot API running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
