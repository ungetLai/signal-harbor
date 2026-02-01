import { Router, Request, Response } from 'express';

const router = Router();

// POST /intake - Accept inbound signals
router.post('/intake', (req: Request, res: Response) => {
  const payload = req.body;
  const headers = req.headers;

  // Acknowledge immediately to avoid upstream timeout
  res.status(202).json({ received: true });

  // Prepare payload for downstream dispatch (async, non-blocking)
  setImmediate(() => {
    dispatchSignal(payload, headers);
  });
});

/**
 * Function to prepare signal for downstream processing
 */
async function dispatchSignal(payload: any, headers: any): Promise<void> {
  try {
    const eventType = headers['x-github-event'];
    console.log(`Signal received: ${eventType || 'unknown'}`);

    let message = '';

    if (eventType === 'ping') {
      message = '📡 GitHub Webhook 測試連線成功！訊號港口已就緒。';
    } else if (eventType === 'pull_request') {
      const action = payload.action;
      const title = payload.pull_request?.title;
      const author = payload.pull_request?.user?.login;
      const url = payload.pull_request?.html_url;
      message = `🚀 **Pull Request ${action}**\n作者: ${author}\n標題: ${title}\n連結: ${url}`;
    } else if (eventType === 'push') {
      const repo = payload.repository?.full_name;
      const pusher = payload.pusher?.name;
      const ref = payload.ref;
      const commitCount = payload.commits?.length || 0;
      message = `🛠️ **Push Event**\n倉庫: ${repo}\n推送者: ${pusher}\n分支: ${ref}\nCommit 數量: ${commitCount}`;
    } else {
      // Generic fallback
      const repo = payload.repository?.full_name || '未知倉庫';
      message = `🔔 **GitHub 事件: ${eventType}**\n來自倉庫: ${repo}`;
    }

    if (message) {
      await forwardToOpenClaw(message);
    }
  } catch (error) {
    console.error('Failed to dispatch signal:', error);
  }
}

async function forwardToOpenClaw(text: string): Promise<void> {
  const hookUrl = process.env.OPENCLAW_HOOK_URL;
  const hookToken = process.env.OPENCLAW_HOOK_TOKEN;

  if (!hookUrl || !hookToken) {
    console.error('Missing OPENCLAW_HOOK_URL or OPENCLAW_HOOK_TOKEN');
    return;
  }

  try {
    const response = await fetch(hookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hookToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        mode: 'now',
      }),
    });

    const result = await response.json();
    console.log('Forwarded to OpenClaw:', result);
  } catch (error) {
    console.error('Failed to forward to OpenClaw:', error);
  }
}

export default router;
