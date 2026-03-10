// cf_ai_study-buddy - Main Worker Entry Point
// Routes requests to the ChatSession Durable Object

export { ChatSession } from './chat-session.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers for Pages frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: POST /chat — send a message
    if (url.pathname === '/chat' && request.method === 'POST') {
      try {
        const { sessionId, message } = await request.json();
        if (!sessionId || !message) {
          return Response.json({ error: 'sessionId and message are required' }, { status: 400, headers: corsHeaders });
        }

        // Get or create the Durable Object for this session
        const id = env.CHAT_SESSION.idFromName(sessionId);
        const stub = env.CHAT_SESSION.get(id);

        // Forward the request to the Durable Object
        const doResponse = await stub.fetch(new Request('https://internal/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }));

        const result = await doResponse.json();
        return Response.json(result, { headers: corsHeaders });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
      }
    }

    // Route: GET /history?sessionId=xxx — retrieve chat history
    if (url.pathname === '/history' && request.method === 'GET') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) {
        return Response.json({ error: 'sessionId is required' }, { status: 400, headers: corsHeaders });
      }

      const id = env.CHAT_SESSION.idFromName(sessionId);
      const stub = env.CHAT_SESSION.get(id);

      const doResponse = await stub.fetch(new Request('https://internal/history'));
      const result = await doResponse.json();
      return Response.json(result, { headers: corsHeaders });
    }

    // Route: DELETE /session?sessionId=xxx — clear a session
    if (url.pathname === '/session' && request.method === 'DELETE') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) {
        return Response.json({ error: 'sessionId is required' }, { status: 400, headers: corsHeaders });
      }

      const id = env.CHAT_SESSION.idFromName(sessionId);
      const stub = env.CHAT_SESSION.get(id);

      const doResponse = await stub.fetch(new Request('https://internal/clear', { method: 'DELETE' }));
      const result = await doResponse.json();
      return Response.json(result, { headers: corsHeaders });
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  },
};
