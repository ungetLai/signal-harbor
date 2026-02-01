import { Router, Request, Response } from 'express';

const router = Router();

// POST /intake - Accept inbound signals
router.post('/intake', (req: Request, res: Response) => {
  const payload = req.body;

  // Acknowledge immediately to avoid upstream timeout
  res.status(202).json({ received: true });

  // Prepare payload for downstream dispatch (async, non-blocking)
  // This is a stub and will be enhanced with actual dispatcher logic
  setImmediate(() => {
    dispatchSignal(payload);
  });
});

/**
 * Stub function to prepare signal for downstream processing
 * Future implementation will handle validation, normalization, and routing
 */
async function dispatchSignal(payload: any): Promise<void> {
  try {
    console.log('Signal queued for dispatch:', {
      timestamp: new Date().toISOString(),
      payloadSize: JSON.stringify(payload).length,
    });

    // TODO: Forward to downstream service
    // const result = await forwardToDispatcher(payload);
  } catch (error) {
    console.error('Failed to dispatch signal:', error);
  }
}

export default router;
