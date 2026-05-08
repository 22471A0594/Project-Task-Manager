const express = require('express');

// 1. Initialize minimal Express instance
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Mandatory for Railway external routing

console.log(`=== STARTING DEPLOYMENT LIFECYCLE ===`);
console.log(`[1] PORT configuration detected: ${PORT}`);
console.log(`[2] DATABASE_URL configuration detected: ${process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'}`);

// 2. Define Immediate Health Check Routes (Always Available)
app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f4f8;">
        <div style="text-align: center; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #2563eb;">🚀 ProjectPilot API is Live!</h1>
          <p>The backend is successfully deployed and actively listening on Railway.</p>
          <p style="color: #64748b; font-size: 0.9rem;">Status: OK | Environment: ${process.env.NODE_ENV || 'development'}</p>
        </div>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Minimal startup successful' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 3. Start Minimal Server Immediately
const server = app.listen(PORT, HOST, () => {
  console.log(`[3] 🚀 ProjectPilot Express server is actively listening on http://${HOST}:${PORT}`);
  console.log(`[4] ✅ Health endpoints actively responding. Railway proxy is unblocked.`);
  
  // 4. Defer the heavy application loading
  loadFullApplication().catch(err => {
    console.error('❌ [FATAL] Deferred application load crashed:', err);
  });
});

async function loadFullApplication() {
  console.log(`[5] Attempting to load full application structure...`);
  
  try {
    // Dynamically require the full Express app configurations
    const fullApp = require('./app');
    
    // Attach the full app logic onto our minimal running app
    app.use('/', fullApp);
    
    console.log(`[6] 📦 Routes and middleware successfully attached.`);
    
    // Dynamically require Prisma and connect
    const prisma = require('./config/db');
    console.log(`[7] 🔌 Attempting to connect to Prisma Database...`);
    
    await prisma.$connect();
    console.log(`[8] ✅ [SUCCESS] Prisma Database connected successfully!`);
  } catch (err) {
    console.error('❌ [ERROR] Full application load encountered an issue:', err);
    // We intentionally DO NOT process.exit(1) here so the health checks remain alive for debugging
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
  try {
    const prisma = require('./config/db');
    await prisma.$disconnect();
  } catch(e) {}
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  try {
    const prisma = require('./config/db');
    await prisma.$disconnect();
  } catch(e) {}
  process.exit(0);
});
