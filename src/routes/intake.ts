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
    const githubEvent = headers['x-github-event'];
    const kanbanEvent = headers['x-kanban-event'];
    
    console.log(`Signal received: GitHub=${githubEvent || 'none'}, Kanban=${kanbanEvent || 'none'}`);

    let message = '';
    let targetUrl = process.env.OPENCLAW_HOOK_URL;
    let targetToken = process.env.OPENCLAW_HOOK_TOKEN;

    if (githubEvent) {
      if (githubEvent === 'ping') {
        message = '📡 GitHub Webhook 測試連線成功！訊號港口已就緒。';
      } else if (githubEvent === 'pull_request') {
        const action = payload.action;
        const title = payload.pull_request?.title || '';
        const author = payload.pull_request?.user?.login;
        const url = payload.pull_request?.html_url;

        // 解析秘密簽名 [名字 圖徽]
        const signatureMatch = title.match(/\[(.*?) (.*?)\]$/);
        const displayName = signatureMatch ? `${signatureMatch[2]} ${signatureMatch[1]}` : author;
        
        message = `🚀 **PR ${action}**\n戰士: ${displayName}\n內容: ${title.replace(/\[.*?\]$/, '').trim()}\n情報: ${url}`;
      } else if (githubEvent === 'push') {
        const repo = payload.repository?.full_name;
        const pusher = payload.pusher?.name;
        const ref = payload.ref.replace('refs/heads/', '');
        const commits = payload.commits || [];
        
        let commitLogs = '';
        commits.forEach((c: any) => {
          const msg = c.message || '';
          const sigMatch = msg.match(/\[(.*?) (.*?)\]$/);
          const sig = sigMatch ? `${sigMatch[2]} ${sigMatch[1]}` : pusher;
          commitLogs += `\n• ${sig}: ${msg.replace(/\[.*?\]$/, '').trim()}`;
        });

        message = `🛠️ **地盤動向 (${ref})**\n倉庫: ${repo}${commitLogs}`;
      } else {
        // Generic fallback
        const repo = payload.repository?.full_name || '未知倉庫';
        message = `🔔 **GitHub 事件: ${githubEvent}**\n來自倉庫: ${repo}`;
      }
    } else if (kanbanEvent) {
      const task = payload;
      const content = task.content || '無標題';
      const project = task.projectName || '未分類';
      const user = task.updatedBy || task.createdBy || '未知成員';

      if (kanbanEvent === 'task_created' && task.status === 'backlog') {
        message = `📋 **新需求進入 BackLog**\n任務: ${content}\n專案: ${project}\n發起人: ${user}\n\n*請企劃機器人開始分析需求。*`;
        targetUrl = process.env.PLANNER_HOOK_URL;
        targetToken = process.env.PLANNER_HOOK_TOKEN;
      } else if (kanbanEvent === 'task_moved' && task.status === 'todo') {
        message = `⚙️ **任務已就緒 (Todo)**\n任務: ${content}\n專案: ${project}\n更新者: ${user}\n\n*請編程機器人開始執行開發。*`;
        targetUrl = process.env.PROGRAMMER_HOOK_URL;
        targetToken = process.env.PROGRAMMER_HOOK_TOKEN;
      } else {
        message = `📍 **看板動態: ${kanbanEvent}**\n任務: ${content}\n狀態: ${task.status}\n更新者: ${user}`;
      }
    }

    if (message) {
      await forwardToOpenClaw(message, targetUrl, targetToken);
    }
  } catch (error) {
    console.error('Failed to dispatch signal:', error);
  }
}

async function forwardToOpenClaw(text: string, url?: string, token?: string): Promise<void> {
  const hookUrl = url || process.env.OPENCLAW_HOOK_URL;
  const hookToken = token || process.env.OPENCLAW_HOOK_TOKEN;

  if (!hookUrl || !hookToken) {
    console.error('Missing destination Hook URL or Token');
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
