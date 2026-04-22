import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeStorage } from './services/jsonStorageService';
import studentRouter from './routes/studentRoutes';
import { errorHandler } from './middlewares/errorHandler';

// ─── Startup validation ───────────────────────────────────────────────────────

const REQUIRED_ENV = ['PORT', 'FRONTEND_URL', 'DATA_DIR'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[startup] Missing required environment variable: ${key}`);
    process.exit(1);
  }
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
