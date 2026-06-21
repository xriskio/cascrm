"use client"
import SearchResults from "@/components/dashboard/SearchResults"
import NotificationBell from "@/components/dashboard/NotificationBell"

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const BG1  = '#0C0C0E';
const BG2  = '#141416';
const BG3  = '#1A1A1E';
const BD   = 'rgba(192,192,200,0.10)';
const BDM  = 'rgba(192,192,200,0.18)';
const TEXT = '#E2E2E8';
const T2   = '#9A9AAA';
const T3   = '#52525E';
const BLUE = '#3B82F6';
const BLUE_BG = 'rgba(59,130,246,0.10)';
const BLUE_BD = 'rgba(59,130,246,0.25)';
const FONT = 'Inter, DM Sans, system-ui, sans-serif';
const MONO = '"JetBrains Mono", "DM Mono", monospace';

interface TopbarProps { onNewSubmission?: () => void; }

export default function Topbar({ onNewSubmission }: TopbarProps) {
  const [searchQ, setSearchQ]       = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [dateStr, setDateStr]       = useState('');
  const [notifHover, setNotifHover] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    }));
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === '/' && !(document.activeElement instanceof HTMLInputElement)) {
        e.preventDefault(); inputRef.current?.focus();
      }
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQ(''); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div style={{
      height: 52, background: BG1, borderBottom: `1px solid ${BD}`,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 20px', flexShrink: 0, fontFamily: FONT,
    }}>
      {/* Left: title + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px', color: TEXT }}>Dashboard</div>
        <div style={{ fontSize: 11, color: T3, fontFamily: MONO }}>{dateStr}</div>
      </div>

      {/* Search */}
      <div ref={searchRef} style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: BG2, border: `1px solid ${searchOpen ? BLUE_BD : BDM}`,
            borderRadius: 8, padding: '0 11px', height: 32, cursor: 'text',
            boxShadow: searchOpen ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onClick={() => inputRef.current?.focus()}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search clients, policies, tasks…"
            autoComplete="off"
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontFamily: FONT, fontSize: 12, color: TEXT, outline: 'none',
            }}
          />
          {searchQ ? (
            <button
              onClick={e => { e.stopPropagation(); setSearchQ(''); inputRef.current?.focus(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 16, lineHeight: 1, padding: '0 2px' }}
            >×</button>
          ) : (
            <span style={{ fontSize: 9.5, fontFamily: MONO, background: BG3, color: T3, padding: '1px 4px', borderRadius: 3, border: `1px solid ${BDM}`, flexShrink: 0 }}>/</span>
          )}
        </div>

        <SearchResults query={searchQ} open={searchOpen && searchQ.length > 1} onClose={()=>{setSearchOpen(false);setSearchQ("")}} />`,     label: `Clients matching "${searchQ}"`,     icon: '◉', bg: 'rgba(34,197,94,0.10)',   color: '#22C55E' },
              { href: `/renewals?search=${encodeURIComponent(searchQ)}`,    label: `Renewals matching "${searchQ}"`,    icon: '↻', bg: 'rgba(245,158,11,0.10)', color: '#F59E0B' },
              { href: `/submissions?search=${encodeURIComponent(searchQ)}`, label: `Submissions matching "${searchQ}"`, icon: '◻', bg: 'rgba(59,130,246,0.10)',  color: '#3B82F6' },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => { setSearchOpen(false); setSearchQ(''); }} style={{ textDecoration: 'none' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 14px', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = BG3; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, background: item.bg, color: item.color, flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, fontFamily: FONT }}>{item.label}</div>
                  <span style={{ marginLeft: 'auto', color: T3, fontSize: 13 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* AI Copilot pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20,
          background: BLUE_BG, border: `1px solid ${BLUE_BD}`,
          fontSize: 11.5, fontWeight: 500, color: BLUE, cursor: 'pointer',
          fontFamily: FONT,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: BLUE,
            flexShrink: 0, display: 'inline-block', animation: 'aiPulse 2s ease infinite',
          }} />
          AI Copilot
        </div>

        <NotificationBell />

        {/* New Submission */}
        <button
          onClick={onNewSubmission}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '0 14px', height: 32,
            background: BLUE, color: '#fff',
            border: 'none', borderRadius: 8,
            fontFamily: FONT, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Submission
        </button>
      </div>
    </div>
  );
}
