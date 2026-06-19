'use client';

import { useEffect, useRef, useState } from 'react';

const BG1 = '#0F0F11';
const BG2 = '#141416';
const BG3 = '#1A1A1E';
const BD = 'rgba(255,255,255,0.06)';
const BDM = 'rgba(255,255,255,0.10)';
const TEXT = '#F0F0F2';
const T2 = '#8A8A96';
const T3 = '#52525E';
const BLUE = '#3B82F6';
const FONT = 'Inter, DM Sans, system-ui, sans-serif';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'Which renewals are expiring soonest?',
  'Summarize my pending submissions and leads.',
  'Draft a renewal reminder email for my next expiring policy.',
  'What should I prioritize today?',
];

export default function CopilotPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, fontFamily: FONT }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(440px, 100vw)',
          background: BG1, borderLeft: `1px solid ${BDM}`, display: 'flex', flexDirection: 'column',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 16px', borderBottom: `1px solid ${BD}` }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, boxShadow: `0 0 8px ${BLUE}` }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>AI Copilot</div>
          <div style={{ fontSize: 10.5, color: T3 }}>InsureTrac workflow assistant</div>
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: T2, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
            aria-label="Close"
          >×</button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12.5, color: T2, lineHeight: 1.5 }}>
                Ask about your renewals, submissions, leads and clients, or have me draft client correspondence. I use your live workflow data.
              </div>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    textAlign: 'left', background: BG2, border: `1px solid ${BDM}`, borderRadius: 10,
                    padding: '10px 12px', color: TEXT, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT,
                  }}
                >{s}</button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                background: m.role === 'user' ? 'rgba(59,130,246,0.14)' : BG2,
                border: `1px solid ${m.role === 'user' ? 'rgba(59,130,246,0.30)' : BDM}`,
                color: TEXT, borderRadius: 12, padding: '10px 13px',
                fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}
            >{m.content}</div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', color: T2, fontSize: 12.5, padding: '4px 2px' }}>Thinking…</div>
          )}
          {error && (
            <div style={{ alignSelf: 'stretch', color: '#FCA5A5', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)', borderRadius: 10, padding: '9px 12px', fontSize: 12 }}>{error}</div>
          )}
        </div>

        {/* Composer */}
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${BD}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: BG2, border: `1px solid ${BDM}`, borderRadius: 12, padding: '8px 10px' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask the Copilot…  (Enter to send)"
              rows={1}
              style={{
                flex: 1, resize: 'none', maxHeight: 120, border: 'none', background: 'transparent',
                color: TEXT, fontSize: 13, fontFamily: FONT, outline: 'none', lineHeight: 1.5,
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                background: BLUE, color: '#fff', border: 'none', borderRadius: 8, width: 32, height: 32,
                cursor: loading || !input.trim() ? 'default' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
