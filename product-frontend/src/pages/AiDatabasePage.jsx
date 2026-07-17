import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSend, MdPerson, MdSmartToy, MdDeleteSweep, MdStorage } from 'react-icons/md';
import { RiDatabase2Fill } from 'react-icons/ri';
import AiService from '../services/AiService';

const EXAMPLES = [
  'Which Samsung phones are under ₹50,000?',
  'Show phones with Snapdragon 8 Elite processor',
  'What is the highest rated phone?',
  'List phones with more than 6000mAh battery',
  'Compare Apple and Samsung inventory',
  'Average price of all phones',
  'Which phones have 16GB RAM?',
  'Show phones sorted by price',
  'Which brand has the most products?',
  'Phones under ₹25,000 sorted by rating',
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 20 }}>
      {[0, 1, 2].map((i) => (
        <motion.div key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

function ResultTable({ results }) {
  if (!results || results.length === 0) return null;
  const keys = Object.keys(results[0]).filter(k => !['image_url', 'id'].includes(k));
  const labelMap = { name: 'Product', brand: 'Brand', price: 'Price', processor: 'Processor',
    ram: 'RAM', storage: 'Storage', battery: 'Battery', camera: 'Camera',
    display: 'Display', rating: 'Rating', stock: 'Stock' };

  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--color-border-light)' }}>
            {keys.map(k => (
              <th key={k} style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 600,
                color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase',
                letterSpacing: '0.04em', whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border)' }}>
                {labelMap[k] || k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
              {keys.map(k => (
                <td key={k} style={{ padding: '7px 10px', color: 'var(--color-text-primary)',
                  whiteSpace: k === 'name' ? 'nowrap' : 'normal' }}>
                  {k === 'price' ? `₹${Number(row[k]).toLocaleString()}`
                    : k === 'rating' ? `⭐ ${row[k]}`
                    : String(row[k] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', gap: 10, marginBottom: 16,
        flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'var(--color-border-light)' : 'var(--color-accent-light)',
        color: isUser ? 'var(--color-text-secondary)' : 'var(--color-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
        {isUser ? <MdPerson /> : <MdSmartToy />}
      </div>

      <div style={{ maxWidth: '80%', minWidth: 80 }}>
        {msg.typing ? (
          <div style={{ padding: '10px 14px', background: 'var(--color-card)',
            border: '1px solid var(--color-border)', borderRadius: '4px 14px 14px 14px' }}>
            <TypingDots />
          </div>
        ) : (
          <div style={{ background: isUser ? 'var(--color-accent)' : 'var(--color-card)',
            color: isUser ? 'white' : 'var(--color-text-primary)',
            border: isUser ? 'none' : '1px solid var(--color-border)',
            borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
            padding: '10px 14px', fontSize: 13, lineHeight: 1.6 }}>
            {/* AI explanation */}
            {msg.explanation && (
              <p style={{ margin: '0 0 10px', fontStyle: 'italic',
                color: isUser ? 'rgba(255,255,255,0.9)' : 'var(--color-text-secondary)' }}>
                {msg.explanation}
              </p>
            )}
            {/* Query result count badge */}
            {msg.resultCount !== undefined && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                marginBottom: msg.results?.length ? 8 : 0 }}>
                <RiDatabase2Fill size={11} />
                {msg.resultCount} result{msg.resultCount !== 1 ? 's' : ''} found
              </div>
            )}
            {/* Table */}
            {msg.results && <ResultTable results={msg.results} />}
            {/* Plain text */}
            {!msg.results && !msg.explanation && (
              <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
            )}
            {msg.error && (
              <span style={{ color: isUser ? 'rgba(255,255,255,0.85)' : 'var(--color-danger)' }}>
                {msg.content}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AiDatabasePage() {
  const [messages, setMessages] = useState([{
    id: 0, role: 'assistant',
    explanation: 'I can answer questions about your product database in plain English. Ask me anything — I\'ll convert it to SQL and show you the results.',
    resultCount: undefined, results: null,
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

    const userMsg = { id: idRef.current++, role: 'user', content: q };
    const typingMsg = { id: idRef.current++, role: 'assistant', typing: true };
    setMessages(p => [...p, userMsg, typingMsg]);
    setLoading(true);

    try {
      const res = await AiService.queryDatabase(q);
      const data = res.data;
      setMessages(p => p.map(m => m.typing ? {
        ...m, typing: false,
        explanation: data.aiExplanation,
        results: data.success ? data.results : null,
        resultCount: data.success ? data.resultCount : undefined,
        content: !data.success ? (data.errorMessage || 'Could not process query.') : null,
        error: !data.success,
      } : m));
    } catch {
      setMessages(p => p.map(m => m.typing ? {
        ...m, typing: false, content: 'Connection error. Is the backend running?', error: true,
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
          <RiDatabase2Fill style={{ color: 'var(--color-accent)' }} />
          AI Chat with Database
        </h1>
        <p>Ask anything in plain English — AI converts it to SQL and answers from your database</p>
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
          background: 'var(--color-card)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Database AI</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>NL → SQL → Answer</span>
            </div>
            <button className="btn btn-secondary" onClick={() => {
              setMessages([{ id: 0, role: 'assistant',
                explanation: 'Chat cleared. Ask me about your products database.', results: null }]);
            }} style={{ padding: '5px 10px', fontSize: 12 }}>
              <MdDeleteSweep size={14} /> Clear
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
            <AnimatePresence>{messages.map(m => <ChatBubble key={m.id} msg={m} />)}</AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border)',
            display: 'flex', gap: 8 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()} disabled={loading}
              placeholder="Ask about your database… e.g. 'Show gaming phones under ₹40,000'"
              style={{ flex: 1, padding: '9px 12px', background: 'var(--color-bg)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                fontSize: 13, color: 'var(--color-text-primary)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
            <button className="btn btn-primary" onClick={() => send()}
              disabled={loading || !input.trim()} style={{ padding: '9px 14px' }}>
              <MdSend size={15} />
            </button>
          </div>
        </div>

        {/* Examples panel */}
        <div style={{ width: 230, background: 'var(--color-card)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: 14, overflowY: 'auto', flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Try These Queries
          </div>
          {EXAMPLES.map((q, i) => (
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
