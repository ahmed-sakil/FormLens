import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import app from './app.js';
import { prisma } from './config/prisma.js';
import { startReminderJob } from './jobs/reminderJob.js';
import { logger } from './utils/logger.js';

async function main() {
  const port = process.env.PORT || 3001;
  const server = app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });

  // Attempt database connection without hard crashing Express server
  prisma.$connect()
    .then(() => {
      logger.info('Connected to PostgreSQL database');
      startReminderJob();
      logger.info('Started reminder job');
    })
    .catch((err) => {
      logger.warn('Database connection pending or paused. Express server is running, will retry queries on demand.', {
        error: err.message
      });
    });

  const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    server.close();
    await prisma.$disconnect().catch(() => {});
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main();

