/**
 * components/dashboard/ui.tsx
 * Shared dark-theme UI primitives — exact match to reference design.
 */
'use client';
import { useState } from 'react';

// ── EMPTY STATE ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub, onAdd, addLabel = '+ Add' }: {
  icon: string; title: string; sub: string; onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'36px 20px', gap:8, textAlign:'center' }}>
      <div style={{ fontSize:26, opacity:0.2, marginBottom:2 }}>{icon}</div>
      <div style={{ fontSize:12.5, fontWeight:500, color:'var(--text2)' }}>{title}</div>
      <div style={{ fontSize:11, color:'var(--text3)', maxWidth:220, lineHeight:1.6 }}>{sub}</div>
      {onAdd && (
        <button onClick={onAdd} style={{ marginTop:6, padding:'6px 14px', borderRadius:'var(--r)', border:'1px solid var(--border2)', background:'transparent', fontFamily:'var(--font)', fontSize:11, color:'var(--text2)', cursor:'pointer' }}
          onMouseEnter={e=>(e.currentTarget.style.background='var(--bg3)')}
          onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
          {addLabel}
        </button>
      )}
    </div>
  );
}

// ── CARD ──────────────────────────────────────────────────────────────────────
export function Card({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div id={id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--rl)', overflow:'hidden', transition:'border-color 0.15s' }}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--border)', gap:8 }}>{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:12.5, fontWeight:600, letterSpacing:'-0.2px', color:'var(--text)' }}>{children}</div>;
}

export function CardCount({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize:10, fontWeight:500, background:'var(--bg3)', color:'var(--text3)', padding:'1px 6px', borderRadius:20, border:'1px solid var(--border)' }}>{children}</span>;
}

// ── PILL TABS ─────────────────────────────────────────────────────────────────
export function PillTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display:'flex', background:'var(--bg3)', borderRadius:6, padding:2, gap:1, border:'1px solid var(--border)' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          padding:'3px 8px', fontSize:10.5, fontWeight:500, borderRadius:4,
          border: active===t ? '1px solid var(--border2)' : 'none',
          background: active===t ? 'var(--bg4)' : 'transparent',
          cursor:'pointer', color: active===t ? 'var(--text)' : 'var(--text3)',
          fontFamily:'var(--font)', transition:'all 0.1s',
        }}>{t}</button>
      ))}
    </div>
  );
}

// ── LINK BUTTON ───────────────────────────────────────────────────────────────
export function LinkBtn({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) {
  const [h, setH] = useState(false);
  const style: React.CSSProperties = {
    fontSize:11, color:'var(--blue)', cursor:'pointer', padding:'3px 7px',
    borderRadius:5, fontWeight:500, border:'none',
    background: h ? 'var(--blue-bg)' : 'transparent',
    fontFamily:'var(--font)', transition:'background 0.1s', textDecoration:'none',
  };
  if (href) {
    return (
      <a href={href} style={style} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={style} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
      {children}
    </button>
  );
}

// ── ADD ROW BUTTON ────────────────────────────────────────────────────────────
export function AddRowBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:6, padding:'9px 16px',
      fontSize:11.5, color: h ? 'var(--text2)' : 'var(--text3)', cursor:'pointer',
      borderTop:'1px solid var(--border)', background: h ? 'var(--bg3)' : 'transparent',
      width:'100%', border:'none',
      fontFamily:'var(--font)', transition:'background 0.1s, color 0.1s',
    }}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
      + {label}
    </button>
  );
}

// ── ROW ACTIONS ───────────────────────────────────────────────────────────────
export function RowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
      {onEdit && (
        <RowBtn onClick={onEdit} title="Edit">✎</RowBtn>
      )}
      {onDelete && (
        <RowBtn onClick={onDelete} title="Delete" danger>✕</RowBtn>
      )}
    </div>
  );
}

function RowBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick?: () => void; title: string; danger?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title} style={{
      width:24, height:24, borderRadius:5,
      border: `1px solid ${h && danger ? 'var(--red-bd)' : 'var(--border2)'}`,
      background: h ? (danger ? 'var(--red-bg)' : 'var(--bg4)') : 'transparent',
      cursor:'pointer', color: h ? (danger ? 'var(--red)' : 'var(--text)') : 'var(--text3)',
      fontSize:11, display:'flex', alignItems:'center', justifyContent:'center',
      transition:'all 0.1s', fontFamily:'var(--font)',
    }}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
      {children}
    </button>
  );
}

// ── PRIMARY BUTTON ────────────────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:5, padding:'0 12px', height:30,
      background:'var(--blue)', color:'#fff', border:'none', borderRadius:'var(--r)',
      fontFamily:'var(--font)', fontSize:11.5, fontWeight:500, cursor:'pointer',
      whiteSpace:'nowrap', boxShadow:'0 0 16px rgba(59,130,246,0.25)', transition:'opacity 0.1s',
    }}
      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.opacity='0.85';}}
      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.opacity='1';}}>
      {children}
    </button>
  );
}

// ── AI DOT ────────────────────────────────────────────────────────────────────
export function AiDot() {
  return (
    <span style={{
      width:6, height:6, borderRadius:'50%', background:'var(--blue)',
      flexShrink:0, display:'inline-block', animation:'aiPulse 2s ease infinite',
    }}/>
  );
}

// ── CHIP ──────────────────────────────────────────────────────────────────────
type ChipVariant = 'high' | 'medium' | 'low' | 'urgent' | 'pending' | 'quoted' | 'progress';
const CHIP_STYLES: Record<string, { bg: string; color: string; bd: string }> = {
  high:     { bg:'var(--red-bg)',    color:'var(--red)',    bd:'var(--red-bd)'    },
  urgent:   { bg:'var(--red-bg)',    color:'var(--red)',    bd:'var(--red-bd)'    },
  medium:   { bg:'var(--amber-bg)',  color:'var(--amber)',  bd:'var(--amber-bd)'  },
  pending:  { bg:'var(--amber-bg)',  color:'var(--amber)',  bd:'var(--amber-bd)'  },
  low:      { bg:'var(--green-bg)',  color:'var(--green)',  bd:'var(--green-bd)'  },
  quoted:   { bg:'var(--green-bg)',  color:'var(--green)',  bd:'var(--green-bd)'  },
  progress: { bg:'var(--blue-bg)',   color:'var(--blue)',   bd:'var(--blue-bd)'   },
};

export function Chip({ children, variant }: { children: React.ReactNode; variant: ChipVariant }) {
  const s = CHIP_STYLES[variant] ?? CHIP_STYLES.medium;
  return (
    <span style={{
      fontSize:9.5, fontWeight:600, padding:'1px 6px', borderRadius:10,
      background:s.bg, color:s.color, border:`1px solid ${s.bd}`,
    }}>{children}</span>
  );
}

// ── STATUS PILL ───────────────────────────────────────────────────────────────
export function StatusPill({ status }: { status: string }) {
  const s = CHIP_STYLES[status.toLowerCase()] ?? CHIP_STYLES.pending;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text2)' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.color, flexShrink:0 }}/>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
export function Toast({ message, color = 'green', visible }: { message: string; color?: 'green'|'red'|'blue'; visible: boolean }) {
  const dotColor = color === 'green' ? 'var(--green)' : color === 'red' ? 'var(--red)' : 'var(--blue)';
  if (!visible) return null;
  return (
    <div style={{
      position:'fixed', bottom:20, right:20,
      background:'var(--bg3)', color:'var(--text)',
      border:'1px solid var(--border2)',
      padding:'10px 16px', borderRadius:'var(--r)', fontSize:12, fontWeight:500,
      boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', gap:7,
      zIndex:400, animation:'slideUp 0.2s ease', maxWidth:320,
    }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:dotColor, flexShrink:0 }}/>
      {message}
    </div>
  );
}

// ── CONFIRM DIALOG ────────────────────────────────────────────────────────────
export function ConfirmDialog({ title, sub, onConfirm, onCancel }: { title: string; sub: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div onClick={onCancel} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, backdropFilter:'blur(4px)', animation:'fadeIn 0.15s ease' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--bg2)', border:'1px solid var(--red-bd)', borderRadius:'var(--rl)', width:360, maxWidth:'95vw', padding:20, boxShadow:'var(--shadow-lg)', animation:'scaleIn 0.18s ease' }}>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>{title}</div>
        <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6, marginBottom:16 }}>{sub}</div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ padding:'0 12px', height:30, borderRadius:'var(--r)', border:'1px solid var(--border2)', background:'transparent', fontFamily:'var(--font)', fontSize:11.5, color:'var(--text2)', cursor:'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding:'0 12px', height:30, borderRadius:'var(--r)', border:'1px solid var(--red-bd)', background:'var(--red-bg)', fontFamily:'var(--font)', fontSize:11.5, color:'var(--red)', cursor:'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── FORM PRIMITIVES ───────────────────────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:4 }}><label style={{ fontSize:11, fontWeight:500, color:'var(--text2)' }}>{label}</label>{children}</div>;
}

export const inputStyle: React.CSSProperties = {
  border:'1px solid var(--border2)', borderRadius:'var(--r)', padding:'7px 10px',
  fontFamily:'var(--font)', fontSize:12, color:'var(--text)', background:'var(--bg3)',
  outline:'none', width:'100%',
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{ ...inputStyle, ...props.style }}
      onFocus={e=>{ e.currentTarget.style.borderColor='rgba(59,130,246,0.5)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(59,130,246,0.08)'; }}
      onBlur={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow='none'; }}/>
  );
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select {...props} style={{ ...inputStyle, cursor:'pointer' }}
      onFocus={e=>{ e.currentTarget.style.borderColor='rgba(59,130,246,0.5)'; }}
      onBlur={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.10)'; }}>
      {children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} style={{ ...inputStyle, resize:'vertical', minHeight:60, ...props.style }}
      onFocus={e=>{ e.currentTarget.style.borderColor='rgba(59,130,246,0.5)'; }}
      onBlur={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.10)'; }}/>
  );
}
