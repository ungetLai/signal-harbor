import { Router, Request, Response } from 'express';

const router = Router();

// GET /healthz - Service health check
router.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
