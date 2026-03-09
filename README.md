# cf_ai_studyedge 🎓

An AI-powered study assistant and Q&A chatbot built on Cloudflare's AI stack.

## What It Does

Study Buddy is a persistent, context-aware AI tutor powered by **Llama 3.3 70B** on Workers AI. Users can ask questions on any topic and receive clear, educational explanations. The full conversation history is preserved across browser sessions using **Durable Objects** for stateful memory.

## Architecture

| Component | Cloudflare Technology |
|---|---|
| **LLM** | Workers AI — `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| **Workflow / Coordination** | Durable Objects (`ChatSession`) |
| **User Input (Chat UI)** | Cloudflare Pages |
| **Memory / State** | Durable Object persistent storage |

```
Browser (Pages)
    │
    ▼
Cloudflare Worker (index.js)   ← routes /chat, /history, /session
    │
    ▼
ChatSession Durable Object     ← persists messages in DO storage
    │
    ▼
Workers AI (Llama 3.3)         ← generates responses
```

## Project Structure

```
cf_ai_study-buddy/
├── worker/
│   ├── index.js          # Worker entry point + routing
│   ├── chat-session.js   # Durable Object with AI + memory
│   └── wrangler.toml     # Worker config
├── frontend/
│   └── public/
│       └── index.html    # Chat UI (deploy to Pages)
├── README.md
└── PROMPTS.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) v3+
- A Cloudflare account with Workers AI enabled

```bash
npm install -g wrangler
wrangler login
```

## Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/cf_ai_study-buddy
cd cf_ai_study-buddy/worker
```

### 2. Start the Worker (with remote AI)

Workers AI is not available in local dev mode, so use `--remote`:

```bash
wrangler dev --remote
```

The Worker will be available at `http://localhost:8787`.

### 3. Open the frontend

Open `frontend/public/index.html` in your browser. Update the `WORKER_URL` constant at the top of the script to:

```js
const WORKER_URL = 'http://localhost:8787';
```

Then open the HTML file directly in your browser or serve it with:

```bash
npx serve frontend/public
```

## Deploying to Production

### Deploy the Worker

```bash
cd worker
wrangler deploy
```

Note the deployed URL (e.g., `https://cf-ai-study-buddy.<subdomain>.workers.dev`).

### Deploy the Frontend to Pages

1. Update `WORKER_URL` in `frontend/public/index.html` to your deployed Worker URL.
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/) → Create a project.
3. Connect your GitHub repo, set the build output directory to `frontend/public`.
4. Deploy.

## API Reference

### `POST /chat`
Send a message and receive an AI response.

**Body:**
```json
{
  "sessionId": "unique-session-id",
  "message": "Explain quantum entanglement"
}
```

**Response:**
```json
{
  "reply": "Quantum entanglement is...",
  "messageCount": 4
}
```

### `GET /history?sessionId=<id>`
Retrieve the full conversation history for a session.

### `DELETE /session?sessionId=<id>`
Clear all messages for a session.

## Features

- **Persistent memory** — Conversation history survives page refreshes
- **Context-aware** — The LLM sees the full conversation history (up to 20 messages)
- **Clean chat UI** — Built with vanilla HTML/CSS/JS, no frameworks needed
- **New Chat** — Users can reset their session anytime
- **Quick suggestions** — Starter prompts to help new users

## License

MIT
