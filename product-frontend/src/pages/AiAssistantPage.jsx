import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSend, MdPerson, MdSmartToy, MdDeleteSweep } from 'react-icons/md';
import { RiRobot2Fill } from 'react-icons/ri';
import ChatService from '../services/ChatService';

const SUGGESTED = [
  'Which Samsung phone is under ₹40,000?',
  'Best camera phone under ₹50,000?',
  'Best gaming phone?',
  'Compare Apple vs Samsung flagship',
  'Which phone has the best battery life?',
  'Best value for money phone under ₹30,000?',
  'Which phones have 5000mAh+ battery?',
  'Suggest a phone with 108MP or higher camera',
  'What is the highest rated phone in stock?',
  'Which brand has the most products?',
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: 10,
        alignItems: 'flex-start',
        marginBottom: 14,
      }}
    >
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--color-accent-light)',
          color: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flex: '0 0 32px', fontSize: 16,
        }}>
          <MdSmartToy />
        </div>
      )}

      <div
        style={{
          maxWidth: '75%',
          padding: '11px 15px',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          background: isUser ? 'var(--color-accent)' : 'var(--color-card)',
          color: isUser ? 'white' : 'var(--color-text-primary)',
          border: isUser ? 'none' : '1px solid var(--color-border)',
          fontSize: 'var(--font-size-sm)',
          lineHeight: 1.65,
          boxShadow: 'var(--shadow-xs)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {msg.typing ? <TypingDots /> : msg.content}
      </div>

      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--color-border-light)',
          color: 'var(--color-text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flex: '0 0 32px', fontSize: 16,
        }}>
          <MdPerson />
        </div>
      )}
    </motion.div>
  );
}

function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      content: "Hello! I'm your AI Product Assistant. I can help you find the perfect mobile phone from our inventory.\n\nAsk me about:\n• Best phones under a budget\n• Camera, battery, or gaming phones\n• Brand comparisons\n• Stock and inventory questions",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const idRef = useRef(1);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    const userMsg = { id: idRef.current++, role: 'user', content: msg };
    const typingMsg = { id: idRef.current++, role: 'assistant', content: '', typing: true };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setLoading(true);

    try {
      const res = await ChatService.sendMessage(msg);
      const reply = res.data?.reply || 'Sorry, I could not process your request.';
      setMessages((prev) =>
        prev.map((m) => (m.typing ? { ...m, content: reply, typing: false } : m))
      );
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) => (m.typing ? {
          ...m,
          content: 'AI service is unavailable. Please ensure Ollama is running with llama3.2:1b.',
          typing: false,
        } : m))
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 0,
      role: 'assistant',
      content: "Chat cleared. How can I help you today?",
    }]);
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', gap: 16 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RiRobot2Fill style={{ color: 'var(--color-accent)' }} />
          AI Assistant
        </h1>
        <p>Powered by Ollama · llama3.2:1b · Answers based on your inventory</p>
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div
            style={{
              flex: 1,
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Chat header */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--color-success)',
                  boxShadow: '0 0 0 2px var(--color-success-light)',
                }} />
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Product Assistant</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>llama3.2:1b via Ollama</span>
              </div>
              <button className="btn btn-secondary" onClick={clearChat} style={{ padding: '5px 10px', fontSize: 12, gap: 4 }}>
                <MdDeleteSweep size={14} />
                Clear
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 8px' }}>
              <AnimatePresence>
                {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about phones, prices, comparisons…"
                rows={1}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '9px 13px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
              />
              <button
                className="btn btn-primary"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{ padding: '9px 16px', alignSelf: 'stretch' }}
              >
                <MdSend size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions panel */}
        <div style={{
          width: 240,
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Suggested Questions
          </div>
          {SUGGESTED.map((q, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => sendMessage(q)}
              disabled={loading}
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                lineHeight: 1.5,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.color = 'var(--color-accent)';
                e.currentTarget.style.background = 'var(--color-accent-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.background = 'var(--color-bg)';
              }}
            >
              {q}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AiAssistantPage;
