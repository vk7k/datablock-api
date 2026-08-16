const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const PORT = env.PORT || 3000;

let server;

async function startServer() {
  try {
    // Attempt database connection check
    await prisma.$connect();
    console.log('✔ Connected to MySQL database via Prisma');

    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} [${env.NODE_ENV}]`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
    console.warn('⚠️  Starting server in disconnected mode. Please verify DATABASE_URL.');
    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} (Database connection pending)`);
    });
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await prisma.$disconnect();
      console.log('Database connection closed.');
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
