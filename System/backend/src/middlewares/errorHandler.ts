import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  console.error('[errorHandler]', err);
  res.status(500).json({ error: 'Internal server error.' });
};
