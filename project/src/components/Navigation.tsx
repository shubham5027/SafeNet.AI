import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Home, FileText, Map, Newspaper, Brain, AlertTriangle, MessageCircle } from 'lucide-react';

function GeminiChatbotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'emergency' | 'guidance' | 'tips'>('emergency');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          message: input,
        }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { role: 'assistant', text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.' }]);
    } catch (e) {
      setMessages(msgs => [...msgs, { role: 'assistant', text: 'Error contacting Gemini.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-slate-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-white">✕</button>
        <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
          <span>{mode === 'emergency' ? <AlertTriangle className="inline h-5 w-5 text-red-400" /> : <MessageCircle className="inline h-5 w-5 text-blue-400" />}</span>
          <span>Gemini Assistant</span>
        </h2>
        <div className="flex space-x-2 mb-4">
          <button onClick={() => setMode('emergency')} className={`px-3 py-1 rounded ${mode==='emergency'?'bg-red-600 text-white':'bg-slate-700 text-slate-200'}`}>🆘 Emergency</button>
          <button onClick={() => setMode('guidance')} className={`px-3 py-1 rounded ${mode==='guidance'?'bg-blue-600 text-white':'bg-slate-700 text-slate-200'}`}>🧭 Guidance</button>
          <button onClick={() => setMode('tips')} className={`px-3 py-1 rounded ${mode==='tips'?'bg-green-600 text-white':'bg-slate-700 text-slate-200'}`}>🛠️ Tips</button>
        </div>
        <div className="bg-slate-800 rounded p-3 h-56 overflow-y-auto mb-3 text-slate-200 text-sm">
          {messages.length === 0 && <div className="text-slate-400">How can I help you? Select a mode and ask a question.</div>}
          {messages.map((msg, i) => (
            <div key={i} className={`mb-2 ${msg.role==='user'?'text-right':''}`}><span className={msg.role==='user'?'text-blue-300':'text-purple-300'}>{msg.role==='user'?'You':'Gemini'}:</span> {msg.text}</div>
          ))}
          {loading && <div className="text-slate-400">Gemini is typing...</div>}
        </div>
        <div className="flex space-x-2">
          <input
            className="flex-1 rounded bg-slate-700 text-white px-3 py-2 focus:outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Type your question..."
            disabled={loading}
          />
          <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" disabled={loading || !input.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Report Incident', href: '/report', icon: FileText },
    { name: 'Safety Map', href: '/map', icon: Map },
    { name: 'News Feed', href: '/news', icon: Newspaper },
    { name: 'Intelligence', href: '/intelligence', icon: Brain },
    { name: 'Chatbot', href: '/chatbot', icon: MessageCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Shield className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">SafeNet.AI</span>
              <span className="text-xs text-slate-400 -mt-1">Civic Intelligence</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800/50 rounded-lg mt-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.href)
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}