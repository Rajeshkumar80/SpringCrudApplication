import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSend, MdPerson, MdSmartToy, MdDeleteSweep } from 'react-icons/md';
import { RiShoppingBag3Fill } from 'react-icons/ri';
import AiService from '../services/AiService';

const PROMPTS = [
  'I am a college student. Budget ₹25,000. Need good battery and camera.',
  'Best gaming phone under ₹40,000?',
  'I want a flagship phone for business use.',
  'Best camera phone for photography under ₹60,000?',
  'I need a phone for video editing and content creation.',
  'Best budget phone under ₹20,000 with long battery life?',
  'My priority is performance. Budget ₹50,000.',
  'Which phone gives the best value for money under ₹35,000?',
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 20 }}>
      {[0,1,2].map(i => (
        <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)' }}
          animate={{ y: [0,-5,0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
      ))}
    </div>
  );
}

function formatResponse(text) {
  if (!text) return null;
  // Convert emoji headers and markdown-like formatting to structured JSX
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} style={{ height: 6 }} />;

    // Section headers (lines with emoji)
    if (/^[🎯✅📊👍👎🔄💡]/.test(trimmed)) {
      return (
        <div key={i} style={{ fontWeight: 700, fontSize: 13, marginTop: 10, marginBottom: 4,
          color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {trimmed}
        </div>
      );
    }
    // Bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('✔')) {
      return (
        <div key={i} style={{ paddingLeft: 14, fontSize: 13, color: 'var(--color-text-secondary)',
          lineHeight: 1.6, marginBottom: 2 }}>
          {trimmed}
        </div>
      );
    }
    return <div key={i} style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-primary)' }}>{trimmed}</div>;
  });
}

export default function AiConsultantPage() {
  const [messages, setMessages] = useState([{
    id: 0, role: 'assistant',
    content: "Hi! I'm your AI Product Consultant 🛒\n\nTell me about your needs:\n• What's your budget?\n• What will you mainly use the phone for?\n• Any specific features you care about?\n\nI'll recommend the perfect phone with detailed reasoning.",
    plain: true,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const idRef = useRef(1);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    const userMsg = { id: idRef.current++, role: 'user', content: q, plain: true };
    const typingMsg = { id: idRef.current++, role: 'assistant', typing: true };
    setMessages(p => [...p, userMsg, typingMsg]);
    setLoading(true);

    try {
      const res = await AiService.consult(q);
      const reply = res.data?.reply || 'No response received.';
      setMessages(p => p.map(m => m.typing ? { ...m, typing: false, content: reply, plain: false } : m));
    } catch {
      setMessages(p => p.map(m => m.typing ? {
        ...m, typing: false, plain: true,
        content: 'Consultant AI is unavailable. Please ensure Ollama is running.'
      } : m));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', gap: 16 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RiShoppingBag3Fill style={{ color: 'var(--color-accent)' }} />
          AI Product Consultant
        </h1>
        <p>Describe your needs — get expert recommendations with pros, cons, and reasoning</p>
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
          background: 'var(--color-card)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>

          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Shopping Consultant</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Powered by llama3.2:1b</span>
            </div>
            <button className="btn btn-secondary" onClick={() => setMessages([{
              id: 0, role: 'assistant', plain: true,
              content: "Chat cleared. What are you looking for in a phone?"
            }])} style={{ padding: '5px 10px', fontSize: 12 }}>
              <MdDeleteSweep size={14} /> Clear
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
            <AnimatePresence>
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: 10, marginBottom: 16,
                      flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: isUser ? 'var(--color-border-light)' : 'var(--color-accent-light)',
                      color: isUser ? 'var(--color-text-secondary)' : 'var(--color-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                      {isUser ? <MdPerson /> : <MdSmartToy />}
                    </div>
                    <div style={{ maxWidth: '78%',
                      background: isUser ? 'var(--color-accent)' : 'var(--color-card)',
                      color: isUser ? 'white' : 'var(--color-text-primary)',
                      border: isUser ? 'none' : '1px solid var(--color-border)',
                      borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                      padding: '10px 14px' }}>
                      {msg.typing ? <TypingDots />
                        : msg.plain
                          ? <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                          : <div>{formatResponse(msg.content)}</div>}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border)',
            display: 'flex', gap: 8 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()} disabled={loading}
              placeholder="e.g. Best gaming phone under ₹40,000 with good battery…"
              style={{ flex: 1, padding: '9px 12px', background: 'var(--color-bg)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                fontSize: 13, color: 'var(--color-text-primary)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
            <button className="btn btn-primary" onClick={() => send()}
              disabled={loading || !input.trim()} style={{ padding: '9px 14px' }}>
              <MdSend size={15} />
            </button>
          </div>
        </div>

        {/* Prompt starters */}
        <div style={{ width: 230, background: 'var(--color-card)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: 14, overflowY: 'auto', flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Quick Prompts
          </div>
          {PROMPTS.map((q, i) => (
            <button key={i} onClick={() => send(q)} disabled={loading}
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '7px 9px', fontSize: 11.5,
                color: 'var(--color-text-secondary)', cursor: 'pointer', textAlign: 'left',
                lineHeight: 1.4, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.color = 'var(--color-accent)';
                e.currentTarget.style.background = 'var(--color-accent-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.background = 'var(--color-bg)'; }}>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
