
import { useState } from 'react';

const BG2  = '#141416';
const BG3  = '#1A1A1E';
const BG4  = '#202026';
const BD   = 'rgba(255,255,255,0.06)';
const BDM  = 'rgba(255,255,255,0.10)';
const TEXT = '#F0F0F2';
const T2   = '#8A8A96';
const T3   = '#52525E';
const BLUE = '#3B82F6';
const AMBER= '#F59E0B';
const GREEN= '#22C55E';
const FONT = 'Inter, DM Sans, system-ui, sans-serif';

const STAGES = [
  { id: 'pending',   label: 'Pending',   dot: BLUE,  count: 0 },
  { id: 'submitted', label: 'Submitted', dot: AMBER, count: 0 },
  { id: 'bound',     label: 'Bound',     dot: GREEN, count: 0 },
];

export default function QuotesPipeline() {
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
        <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>Quotes Pipeline</div>
        <span style={{
          fontSize: 10, fontWeight: 500,
          background: BG3, color: T3, padding: '1px 6px',
          borderRadius: 20, border: `1px solid ${BD}`,
        }}>0 active</span>
        <button
          style={{
            marginLeft: 'auto', fontSize: 11.5, color: BLUE,
            background: addHov ? 'rgba(59,130,246,0.08)' : 'transparent',
            border: 'none', cursor: 'pointer',
            fontFamily: FONT, fontWeight: 500, padding: '3px 7px', borderRadius: 5,
            transition: 'background 0.1s',
          }}
          onMouseEnter={() => setAddHov(true)}
          onMouseLeave={() => setAddHov(false)}
        >
          + Add quote
        </button>
      </div>

      {/* Kanban columns */}
      <div style={{ padding: '14px 16px', display: 'flex', gap: 10 }}>
        {STAGES.map(stage => <KanbanColumn key={stage.id} stage={stage} />)}
      </div>
    </div>
  );
}

function KanbanColumn({ stage }: { stage: typeof STAGES[0] }) {
  const [addHov, setAddHov] = useState(false);

  return (
    <div style={{
      flex: 1, minWidth: 0, border: `1px solid ${BD}`,
      borderRadius: 8, overflow: 'hidden',
    }}>
      {/* Column header */}
      <div style={{
        padding: '8px 11px', background: BG3,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 600, color: T2,
        borderBottom: `1px solid ${BD}`, fontFamily: FONT,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: stage.dot, flexShrink: 0 }} />
        {stage.label}
        <span style={{
          marginLeft: 'auto', fontSize: 10,
          background: BG4, color: T3,
          padding: '1px 5px', borderRadius: 10, fontWeight: 500,
        }}>
          {stage.count}
        </span>
      </div>

      {/* Empty body */}
      <div style={{
        padding: '24px 10px', textAlign: 'center',
        color: T3, fontSize: 10.5, fontFamily: FONT,
      }}>
        Empty
      </div>

      {/* Add button */}
      <div
        style={{
          padding: '7px 10px', fontSize: 10.5, cursor: 'pointer',
          color: addHov ? T2 : T3,
          background: addHov ? BG3 : 'transparent',
          borderTop: `1px solid ${BD}`,
          transition: 'background 0.1s, color 0.1s',
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: FONT,
        }}
        onMouseEnter={() => setAddHov(true)}
        onMouseLeave={() => setAddHov(false)}
      >
        + Add
      </div>
    </div>
  );
}
