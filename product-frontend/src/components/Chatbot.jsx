import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSend, MdClose, MdSmartToy, MdPerson } from 'react-icons/md';
import { RiRobot2Fill } from 'react-icons/ri';
import ChatService from '../services/ChatService';

const QUICK = [
  'Best phone under ₹30,000?',
  'Top rated flagship?',
  'Best camera phone?',
  'Phones with 6000mAh battery?',
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '2px 0', alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
        />
      ))}
    </div>
  );
}

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, role: 'assistant', content: 'Hi! Ask me anything about our mobile phones. 📱' },
  ]);
  const idRef = useRef(1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { id: idRef.current++, role: 'user', content: msg };
    const typing = { id: idRef.current++, role: 'assistant', content: '', typing: true };
    setMessages((p) => [...p, userMsg, typing]);
    setLoading(true);

    try {
      const res = await ChatService.sendMessage(msg);
      setMessages((p) =>
        p.map((m) => (m.typing ? { ...m, content: res.data?.reply || '...', typing: false } : m))
      );
    } catch {
      setMessages((p) =>
        p.map((m) => (m.typing ? { ...m, content: 'AI is unavailable right now.', typing: false } : m))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 24, right: 24, z: 999,
          width: 54, height: 54,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,99,235,0.45)',
          fontSize: 24,
          zIndex: 999,
        }}
        title="AI Chat"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><MdClose /></motion.span>
            : <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><RiRobot2Fill /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'fixed', bottom: 88, right: 24,
              width: 340, height: 480,
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              boxShadow: 'var(--shadow-xl)',
              display: 'flex', flexDirection: 'column',
              zIndex: 998,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '13px 16px',
              background: 'var(--color-accent)',
              color: 'white',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <MdSmartToy size={22} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>AI Product Assistant</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>llama3.2:1b via Ollama</div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: 'white', cursor: 'pointer', padding: 2, opacity: 0.85,
              }}>
                <MdClose size={18} />
              </button>
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div style={{ padding: '8px 10px', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)' }}>
                {QUICK.map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    style={{
                      background: 'var(--color-accent-subtle)',
                      color: 'var(--color-accent)',
                      border: 'none',
                      borderRadius: 99,
                      padding: '4px 10px',
                      fontSize: 11,
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 6px' }}>
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      gap: 7, marginBottom: 10, alignItems: 'flex-end',
                    }}
                  >
                    {!isUser && (
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                        <MdSmartToy />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '80%',
                      padding: '8px 11px',
                      borderRadius: isUser ? '12px 3px 12px 12px' : '3px 12px 12px 12px',
                      background: isUser ? 'var(--color-accent)' : 'var(--color-bg)',
                      color: isUser ? 'white' : 'var(--color-text-primary)',
                      border: isUser ? 'none' : '1px solid var(--color-border)',
                      fontSize: 12,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}>
                      {msg.typing ? <TypingDots /> : msg.content}
                    </div>
                    {isUser && (
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-border-light)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                        <MdPerson />
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                placeholder="Ask about phones…"
                disabled={loading}
                style={{
                  flex: 1, padding: '8px 11px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8, fontSize: 12,
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                style={{
                  padding: '8px 12px',
                  background: 'var(--color-accent)',
                  color: 'white', border: 'none',
                  borderRadius: 8, cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  opacity: (loading || !input.trim()) ? 0.5 : 1,
                }}
              >
                <MdSend size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Chatbot;
