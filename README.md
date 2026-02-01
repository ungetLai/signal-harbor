# Signal Harbor 🦞

一個輕量級的訊號中繼站，專門用於處理 GitHub Webhook 等外部訊號，並轉發至 OpenClaw (Nexora)。

## ✨ 功能

- ✅ **立即回應**: 收到訊號後立即回覆 `202 Accepted`，避免上游（如 GitHub）超時。
- ✅ **智能轉發**: 解析 GitHub JSON 載荷，並格式化為易讀的繁體中文訊息。
- ✅ **無縫接軌**: 透過 OpenClaw 的 `wake` hook 觸發 AI 回應。

## 🚀 支援事件

- `ping`: 連線測試。
- `pull_request`: PR 建立、關閉、同步等。
- `push`: 分支推送事件。

## 📦 安裝與部署

```bash
# 安裝依賴
npm install

# 配置環境變數
cp .env.example .env
# 修改 .env 中的 OPENCLAW_HOOK_URL 與 TOKEN

# 本地開發
npm run dev

# 建置與啟動
npm run build
npm start
```

## ☁️ 環境變數

- `PORT`: 服務監聽埠號 (預設 3000)。
- `OPENCLAW_HOOK_URL`: OpenClaw 的 wake hook 網址。
- `OPENCLAW_HOOK_TOKEN`: Hook 的認證 Token。
