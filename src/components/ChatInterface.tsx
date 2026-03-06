"use client";
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const STORAGE_KEY = 'ag_chat_messages';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  thought?: string;
  timestamp: string;
}

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClear = async () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/clear`);
    } catch (err) {
      console.error('Failed to clear database history', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const chatHistory = messages.map((m) => ({
      role: m.sender === 'user' ? 'human' : 'ai',
      content: m.text,
    }));

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        query: input,
        chat_history: chatHistory,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.answer || 'No response from AI.',
        sender: 'ai',
        thought: response.data.thought_process,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'System Error: Check backend connection.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">

      {/* ── Header ── */}
      <div
        className="shrink-0 flex items-center justify-between px-5 py-4"
        style={{
          background: '#f8f8f8',
          borderBottom: '3px solid #000000',
        }}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-10 h-10 rounded flex items-center justify-center"
            style={{
              background: '#FF0000',
              border: '3px solid #000000',
              boxShadow: '3px 3px 0px #000000',
            }}
          >
            <Bot className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-sm font-black text-black uppercase tracking-widest">
              NEXUS CORE
            </h2>
            <span className="text-[10px] text-red-600 font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-2 bg-red-600 rounded-full inline-block"
              />
              SYSTEM LIVE · 1.5 PRO
            </span>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center space-x-1.5 px-3 py-2 rounded text-[10px] text-black transition-all font-black uppercase tracking-widest"
            style={{ border: '3px solid #000', background: '#fff' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#000';
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#fff';
              (e.currentTarget as HTMLButtonElement).style.color = '#000';
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* ── Scrollable Messages ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Bot className="w-16 h-16 mb-4 text-red-600" />
            </motion.div>
            <p className="max-w-xs text-center text-xs font-black text-black uppercase tracking-widest leading-relaxed">
              System Ready. Feed me documents. <br /> I will digest.
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: m.sender === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[90%] ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {m.sender === 'ai' && (
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center mt-1 shrink-0"
                    style={{
                      background: '#FF0000',
                      border: '3px solid #000000',
                      boxShadow: '3px 3px 0px #000000',
                    }}
                  >
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={m.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  {m.sender === 'user' ? (
                    <p className="leading-relaxed text-sm font-black">{m.text}</p>
                  ) : (
                    <div className="markdown-body text-sm font-bold">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ ...props }) => (
                            <div className="overflow-x-auto my-4 border-2 border-white rounded-none">
                              <table className="min-w-full divide-y divide-white/20" {...props} />
                            </div>
                          ),
                          th: ({ ...props }) => <th className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-wider text-white" {...props} />,
                          td: ({ ...props }) => <td className="px-3 py-2 text-sm text-white/90 border-t border-white/10" {...props} />,
                          strong: ({ ...props }) => <strong className="font-black bg-white text-red-600 px-1" {...props} />,
                          p: ({ ...props }) => <p className="mb-3 last:mb-0 leading-relaxed text-white" {...props} />,
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  {m.thought && (
                    <div
                      className="mt-4 pt-4"
                      style={{ borderTop: '2px solid rgba(255,255,255,0.3)' }}
                    >
                      <details className="group">
                        <summary className="text-[10px] text-white font-black uppercase tracking-widest hover:text-black cursor-pointer list-none transition-colors">
                          [ TRACE LOG + ]
                        </summary>
                        <div
                          className="mt-3 text-[10px] p-4 rounded-none font-mono text-white leading-relaxed"
                          style={{
                            background: '#000000',
                            border: '3px solid #ffffff',
                          }}
                        >
                          {m.thought}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center mt-1 shrink-0 bg-black"
                    style={{ border: '3px solid #FF0000', boxShadow: '3px 3px 0px #FF0000' }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start items-center space-x-3">
            <div
              className="w-8 h-8 rounded bg-red-600 flex items-center justify-center shrink-0"
              style={{ border: '2px solid #000', boxShadow: '2px 2px 0px #000' }}
            >
              <Bot className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="chat-bubble-ai flex space-x-1.5 items-center py-4 px-5">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* ── Fixed Input Bar ── */}
      <div
        className="shrink-0 px-6 py-5 bg-white"
        style={{
          borderTop: '3px solid #000000',
        }}
      >
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="ENTER COMMAND OR QUERY..."
              className="input-2d w-full rounded-none px-5 py-4 pr-14 text-sm font-black uppercase tracking-wide placeholder-gray-400"
            />
            <motion.button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9, x: 2 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-600 border-2 border-black flex items-center justify-center shadow-[2px 2px 0px #000] disabled:opacity-20"
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
