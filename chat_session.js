// ChatSession Durable Object
// Stores conversation history and calls Workers AI (Llama 3.3) for responses

const SYSTEM_PROMPT = `You are Study Buddy, an expert AI tutor and Q&A assistant.
You help students understand complex topics with clear, concise explanations.
You use examples, analogies, and step-by-step breakdowns when helpful.
You are encouraging, patient, and adapt your explanations to the student's level.
When you don't know something, you say so honestly.
Keep responses focused and educational.`;

const MAX_HISTORY = 20; // Keep last 20 messages to stay within context limits

export class ChatSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    // Load persisted messages from DO storage
    this.messages = [];
    this.initialized = false;
  }

  async ensureInitialized() {
    if (!this.initialized) {
      const stored = await this.state.storage.get('messages');
      this.messages = stored || [];
      this.initialized = true;
    }
  }

  async fetch(request) {
    await this.ensureInitialized();

    const url = new URL(request.url);

    // POST /chat — receive user message, call LLM, return reply
    if (url.pathname === '/chat' && request.method === 'POST') {
      const { message } = await request.json();

      // Append user message to history
      this.messages.push({ role: 'user', content: message });

      // Trim to last MAX_HISTORY messages to avoid token overflow
      if (this.messages.length > MAX_HISTORY) {
        this.messages = this.messages.slice(-MAX_HISTORY);
      }

      try {
        // Call Workers AI — Llama 3.3 70B Instruct
        const aiResponse = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...this.messages,
          ],
          max_tokens: 1024,
          temperature: 0.7,
        });

        const reply = aiResponse.response;

        // Append assistant reply to history
        this.messages.push({ role: 'assistant', content: reply });

        // Persist updated history
        await this.state.storage.put('messages', this.messages);

        return Response.json({
          reply,
          messageCount: this.messages.length,
        });
      } catch (err) {
        // Remove the user message if AI call failed
        this.messages.pop();
        return Response.json({ error: `AI call failed: ${err.message}` }, { status: 500 });
      }
    }

    // GET /history — return full conversation history
    if (url.pathname === '/history') {
      return Response.json({
        messages: this.messages,
        messageCount: this.messages.length,
      });
    }

    // DELETE /clear — wipe session history
    if (url.pathname === '/clear' && request.method === 'DELETE') {
      this.messages = [];
      await this.state.storage.delete('messages');
      return Response.json({ success: true, message: 'Session cleared' });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  }
}
