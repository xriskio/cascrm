
import { useState } from 'react';

const BG2  = '#141416';
const BG3  = '#1A1A1E';
const BD   = 'rgba(255,255,255,0.06)';
const BDM  = 'rgba(255,255,255,0.10)';
const TEXT = '#F0F0F2';
const T2   = '#8A8A96';
const T3   = '#52525E';
const BLUE = '#3B82F6';
const RED  = '#EF4444';
const AMBER= '#F59E0B';
const GREEN= '#22C55E';
const FONT = 'Inter, DM Sans, system-ui, sans-serif';
const MONO = '"JetBrains Mono", "DM Mono", monospace';

const STATS = [
  { label: 'All',     value: 0, color: T2   },
  { label: 'Overdue', value: 0, color: RED  },
  { label: 'Pending', value: 0, color: AMBER},
  { label: 'Done',    value: 0, color: GREEN},
];

export default function TaskPanel({ onNewTask }: { onNewTask?: () => void }) {
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
        <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>My Tasks</div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={onNewTask}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '0 12px', height: 30,
              background: BLUE, color: '#fff', border: 'none', borderRadius: 8,
              fontFamily: FONT, fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'opacity 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            + New
          </button>
        </div>
      </div>

      {/* Mini stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: 5, padding: '9px 12px', borderBottom: `1px solid ${BD}`,
      }}>
        {STATS.map(stat => (
          <div key={stat.label} style={{
            textAlign: 'center', padding: '7px 4px', borderRadius: 8, cursor: 'pointer',
            border: `1px solid transparent`,
            transition: 'all 0.1s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = BG3; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <div style={{ fontSize: 18, fontWeight: 500, lineHeight: 1, fontFamily: MONO, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 9, color: T3, marginTop: 2, fontWeight: 500, fontFamily: FONT }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 20px', gap: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 26, opacity: 0.2, marginBottom: 2 }}>✓</div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: T2, fontFamily: FONT }}>No tasks</div>
        <div style={{ fontSize: 11, color: T3, maxWidth: 200, lineHeight: 1.6, fontFamily: FONT }}>
          Add your first task to get started
        </div>
        <button
          onClick={onNewTask}
          style={{
            marginTop: 6, padding: '6px 14px', borderRadius: 8,
            border: `1px solid ${BDM}`, background: 'transparent',
            fontFamily: FONT, fontSize: 11, color: T2, cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = BG3; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          + Add task
        </button>
      </div>

      {/* Footer add */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
          borderTop: `1px solid ${BD}`, cursor: 'pointer', fontSize: 12.5,
          color: addHov ? T2 : T3, background: addHov ? BG3 : 'transparent',
          transition: 'background 0.12s, color 0.12s', fontFamily: FONT,
        }}
        onClick={onNewTask}
        onMouseEnter={() => setAddHov(true)}
        onMouseLeave={() => setAddHov(false)}
      >
        <span style={{ fontSize: 15 }}>+</span> Add new task
      </div>
    </div>
  );
}
