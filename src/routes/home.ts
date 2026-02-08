import { Router, Request, Response } from 'express';

const router = Router();

const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Signal Harbor - API Tester</title>
    <style>
        :root {
            --bg-color: #0a0a0b;
            --card-bg: #141416;
            --accent-color: #ff3e3e;
            --text-color: #e1e1e1;
            --input-bg: #1e1e21;
            --border-color: #2a2a2e;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }

        .container {
            max-width: 800px;
            width: 100%;
        }

        header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 10px;
        }

        h1 {
            margin: 0;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .dark-shadow-mark {
            display: none;
            content: "Nexora Shadow Mark: ungetLai";
        }

        .card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .endpoint-tag {
            background-color: var(--accent-color);
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.8em;
            margin-right: 10px;
        }

        .method {
            font-weight: bold;
            margin-right: 10px;
        }

        .post { color: #49cc90; }
        .get { color: #61affe; }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }

        textarea, select, input {
            width: 100%;
            background-color: var(--input-bg);
            border: 1px solid var(--border-color);
            color: white;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            box-sizing: border-box;
            font-family: 'Courier New', Courier, monospace;
        }

        button {
            background-color: var(--accent-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: opacity 0.2s;
        }

        button:hover {
            opacity: 0.8;
        }

        pre {
            background-color: #000;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            border: 1px solid var(--border-color);
            max-height: 300px;
        }

        .status-ok { color: #49cc90; }
        .status-err { color: #ff3e3e; }
    </style>
</head>
<body>
    <div class="dark-shadow-mark">Nexora Shadow Mark: ungetLai</div>
    <div class="container">
        <header>
            <h1>Signal Harbor <span style="font-size: 0.5em; opacity: 0.6;">v0.1.0</span></h1>
            <p>API Control Interface for Uncle Lai (首領)</p>
        </header>

        <!-- Intake API -->
        <div class="card">
            <h3><span class="endpoint-tag">INTAKE</span> <span class="method post">POST</span> /intake</h3>
            <p>Submit signals to the harbor. Simulates GitHub or Kanban events.</p>
            
            <label for="event-type">Event Type (Header)</label>
            <select id="event-header">
                <option value="x-github-event">x-github-event</option>
                <option value="x-kanban-event">x-kanban-event</option>
            </select>

            <label for="event-value">Event Value</label>
            <input type="text" id="event-value" value="push" placeholder="e.g. push, pull_request, task_created">

            <label for="payload">Payload (JSON)</label>
            <textarea id="payload" rows="10">{
  "ref": "refs/heads/main",
  "repository": {
    "full_name": "ungetLai/signal-harbor"
  },
  "pusher": {
    "name": "ungetLai"
  },
  "commits": [
    {
      "message": "Update API Tester UI [首領 🦞]",
      "author": { "name": "ungetLai" }
    }
  ]
}</textarea>
            
            <button onclick="sendRequest()">Send Signal</button>
        </div>

        <!-- Health Check -->
        <div class="card">
            <h3><span class="endpoint-tag">HEALTH</span> <span class="method get">GET</span> /healthz</h3>
            <button onclick="checkHealth()">Check Health</button>
        </div>

        <div id="response-area" style="display:none;">
            <h3>Response</h3>
            <div id="status-line"></div>
            <pre id="response-body"></pre>
        </div>
    </div>

    <script>
        async function sendRequest() {
            const headerKey = document.getElementById('event-header').value;
            const headerValue = document.getElementById('event-value').value;
            const payload = document.getElementById('payload').value;
            const responseArea = document.getElementById('response-area');
            const statusLine = document.getElementById('status-line');
            const responseBody = document.getElementById('response-body');

            responseArea.style.display = 'block';
            responseBody.textContent = 'Sending...';

            try {
                const response = await fetch('/intake', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [headerKey]: headerValue
                    },
                    body: payload
                });

                const data = await response.json();
                statusLine.innerHTML = \`Status: <span class="\${response.ok ? 'status-ok' : 'status-err'}">\${response.status} \${response.statusText}</span>\`;
                responseBody.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                statusLine.innerHTML = \`<span class="status-err">Error: \${error.message}</span>\`;
                responseBody.textContent = '';
            }
        }

        async function checkHealth() {
            const responseArea = document.getElementById('response-area');
            const statusLine = document.getElementById('status-line');
            const responseBody = document.getElementById('response-body');

            responseArea.style.display = 'block';
            responseBody.textContent = 'Checking...';

            try {
                const response = await fetch('/healthz');
                const data = await response.json();
                statusLine.innerHTML = \`Status: <span class="\${response.ok ? 'status-ok' : 'status-err'}">\${response.status} \${response.statusText}</span>\`;
                responseBody.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                statusLine.innerHTML = \`<span class="status-err">Error: \${error.message}</span>\`;
                responseBody.textContent = '';
            }
        }
    </script>
</body>
</html>
`;

router.get('/', (req: Request, res: Response) => {
  res.send(html);
});

export default router;
