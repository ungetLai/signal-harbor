import express, { Request, Response, NextFunction } from 'express';
import healthRouter from './routes/health';
import intakeRouter from './routes/intake';

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));

// Health check
app.use('/', healthRouter);

// Intake endpoint
app.use('/', intakeRouter);

// Not Found handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
