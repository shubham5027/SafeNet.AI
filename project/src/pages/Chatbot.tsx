import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, MessageCircle, Send } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function Chatbot() {
  const [mode, setMode] = useState<'emergency' | 'guidance' | 'tips'>('emergency');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setLoading(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Mode: ${mode}\nUser: ${input}`
                  }
                ]
              }
            ]
          }),
        }
      );
      const data = await res.json();
      setMessages(msgs => [
        ...msgs,
        { role: 'assistant', text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.' }
      ]);
    } catch (e) {
      setMessages(msgs => [...msgs, { role: 'assistant', text: 'Error contacting Gemini.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-2xl bg-slate-900/90 rounded-2xl shadow-2xl border border-slate-800 flex flex-col h-[80vh]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 rounded-t-2xl border-b border-slate-800 px-6 py-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span>{mode === 'emergency' ? <AlertTriangle className="inline h-6 w-6 text-red-400" /> : <MessageCircle className="inline h-6 w-6 text-blue-400" />}</span>
            <span className="text-2xl font-bold text-white">AI Assistant</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            <strong>Don't share sensitive personal info. For emergencies, call local authorities.
        </strong>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setMode('emergency')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${mode==='emergency'?'bg-red-600 text-white':'bg-slate-800 text-slate-200 hover:bg-red-900/40'}`}>🆘 Emergency</button>
            <button onClick={() => setMode('guidance')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${mode==='guidance'?'bg-blue-600 text-white':'bg-slate-800 text-slate-200 hover:bg-blue-900/40'}`}>🧭 Guidance</button>
            <button onClick={() => setMode('tips')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${mode==='tips'?'bg-green-600 text-white':'bg-slate-800 text-slate-200 hover:bg-green-900/40'}`}>🛠️ Tips</button>
          </div>
        </div>
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 bg-gradient-to-b from-slate-900/80 to-slate-950/80 rounded-b-2xl">
          {messages.length === 0 && (
            <div className="text-slate-400 text-center mt-12">How can I help you? Select a mode and ask a question.</div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role==='user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-md text-sm whitespace-pre-line break-words ${
                msg.role==='user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-slate-800 text-slate-100 rounded-bl-md border border-blue-900/30'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl shadow-md text-sm bg-slate-800 text-slate-400 border border-blue-900/30 animate-pulse">
                Gemini is typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {/* Input Bar */}
        <form
          className="flex items-center gap-2 px-4 py-4 border-t border-slate-800 bg-slate-900/95 rounded-b-2xl"
          onSubmit={e => { e.preventDefault(); handleSend(); }}
        >
          <input
            className="flex-1 rounded-full bg-slate-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 text-base shadow-inner"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !loading) handleSend(); }}
            placeholder="Type your question..."
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full flex items-center justify-center shadow-lg disabled:bg-slate-700 disabled:cursor-not-allowed"
            disabled={loading || !input.trim()}
            title="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
} 