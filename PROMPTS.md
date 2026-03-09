# PROMPTS.md — AI Prompts Used in Development

This file documents all AI prompts used during the development of **cf_ai_study-buddy**, as required by the assignment.

---

## 1. System Prompt (Runtime — sent to Llama 3.3 on every request)

Used in `worker/chat-session.js` to define the assistant's persona and behavior:

```
You are Study Buddy, an expert AI tutor and Q&A assistant.
You help students understand complex topics with clear, concise explanations.
You use examples, analogies, and step-by-step breakdowns when helpful.
You are encouraging, patient, and adapt your explanations to the student's level.
When you don't know something, you say so honestly.
Keep responses focused and educational.
```

---

## 2. Code Generation Prompts (Development — used with Claude during building)

### Project architecture planning

```
I have a Cloudflare AI assignment that requires:
- An LLM (Llama 3.3 on Workers AI)
- Workflow/coordination (Durable Objects or Workflows)
- User input via chat or voice (Pages or Realtime)
- Memory or state

Help me design a study assistant chatbot that satisfies all four requirements.
Describe the architecture and file structure.
```

### Durable Object implementation

```
Write a Cloudflare Durable Object class called ChatSession that:
1. Persists conversation history using DO storage
2. Calls Workers AI (Llama 3.3) with the full message history
3. Trims history to the last 20 messages to stay within token limits
4. Exposes three routes: POST /chat, GET /history, DELETE /clear
Include the system prompt for a study assistant persona.
```

### Worker routing

```
Write a Cloudflare Worker entry point (index.js) that:
1. Routes POST /chat to a ChatSession Durable Object identified by sessionId
2. Routes GET /history to the same DO
3. Routes DELETE /session to clear the session
4. Adds CORS headers for all responses
5. Exports the ChatSession class
```

### Frontend chat UI

```
Create a single-file HTML/CSS/JS chat interface for a study assistant AI.
Design requirements:
- Dark theme with a distinctive aesthetic (not generic purple gradients)
- Monospace font for a technical/academic feel
- Animated typing indicator (bouncing dots)
- Auto-resizing textarea input (Enter to send, Shift+Enter for newline)
- Messages stored in-session; sessionId persisted in localStorage
- Load conversation history from GET /history on startup
- Clear/New Chat button that resets the session
- Starter suggestion buttons on the welcome screen
```

### README writing

```
Write a professional README.md for a Cloudflare AI project called cf_ai_study-buddy.
Include: project description, architecture table, project structure,
prerequisites, local dev instructions (note Workers AI needs --remote flag),
production deploy steps for Worker and Pages, and an API reference section.
```

---

## 3. Debugging Prompts (used during development)

```
My Durable Object is returning 'TypeError: Cannot read properties of undefined'
when calling env.AI.run(). What could cause this in a Cloudflare Worker
and how do I fix it?
```

```
How do I pass messages from a Cloudflare Worker to a Durable Object?
The Worker receives the HTTP request but the DO needs to call Workers AI.
```

---

## Notes

- The runtime system prompt (Section 1) is sent with every API call to Llama 3.3.
- All development prompts (Sections 2–3) were used with Claude (claude.ai) to assist in writing and debugging code.
- All code was reviewed and tested manually before submission.
