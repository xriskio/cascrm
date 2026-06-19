
import { useState } from 'react';

const BG2  = '#141416';
const BG3  = '#1A1A1E';
const BD   = 'rgba(255,255,255,0.06)';
const BDM  = 'rgba(255,255,255,0.10)';
const TEXT = '#F0F0F2';
const T2   = '#8A8A96';
const T3   = '#52525E';
const FONT = 'Inter, DM Sans, system-ui, sans-serif';

const TABS = ['All', 'Tasks', 'Renewals', 'Calls'];

export default function ActivityFeed() {
  const [tab, setTab] = useState('All');
  const [addHov, setAddHov] = useState(false);

  return (
    <div style={{
      background: BG2, border: `1px solid ${BD}`,
      borderRadius: 12, overflow: 'hidden', fontFamily: FONT,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '12px 16px',
        borderBottom: `1px solid ${BD}`, gap: 8,
      }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>Recent Activity</div>
        <div style={{ marginLeft: 'auto' }}>
          {/* Pill tabs */}
          <div style={{
            display: 'flex', background: BG3, borderRadius: 6,
            padding: 2, gap: 1, border: `1px solid ${BD}`,
          }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '3px 8px', fontSize: 10.5, fontWeight: 500, borderRadius: 4,
                  border: tab === t ? `1px solid ${BDM}` : 'none',
                  background: tab === t ? '#202026' : 'transparent',
                  cursor: 'pointer', color: tab === t ? TEXT : T3,
                  fontFamily: FONT, transition: 'all 0.1s',
                }}
              >{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 26, opacity: 0.2, marginBottom: 2 }}>◎</div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: T2, fontFamily: FONT }}>No activity yet</div>
        <div style={{ fontSize: 11, color: T3, maxWidth: 240, lineHeight: 1.6, fontFamily: FONT }}>
          Log calls, tasks, and renewals to build your activity feed.
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
          borderTop: `1px solid ${BD}`, fontSize: 11.5, color: addHov ? T2 : T3,
          cursor: 'pointer', background: addHov ? BG3 : 'transparent',
          transition: 'background 0.1s, color 0.1s', fontFamily: FONT,
        }}
        onMouseEnter={() => setAddHov(true)}
        onMouseLeave={() => setAddHov(false)}
      >
        + Log activity
      </div>
    </div>
  );
}
