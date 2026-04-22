import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeStorage } from './services/jsonStorageService';
import studentRouter from './routes/studentRoutes';
import classRouter from './routes/classRoutes';
import { errorHandler } from './middlewares/errorHandler';

// ─── Startup validation ───────────────────────────────────────────────────────

const REQUIRED_ENV_VARS = [
  'PORT',
  'FRONTEND_URL',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
  'DATA_DIR',
] as const;

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(
    `[startup] Missing required environment variables:\n` +
      missingVars.map((v) => `  - ${v}`).join('\n'),
  );
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 3333;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

// ─── Express app ──────────────────────────────────────────────────────────────

const app = express();

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/students', studentRouter);
app.use('/classes', classRouter);

// ─── Global error handler (must be last) ─────────────────────────────────────

app.use(errorHandler);

// ─── Boot ─────────────────────────────────────────────────────────────────────

const start = async (): Promise<void> => {
  await initializeStorage();
  app.listen(PORT, () => {
    console.error(`[server] Listening on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error('[startup] Fatal error during initialization:', err);
  process.exit(1);
});
