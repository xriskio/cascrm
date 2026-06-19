
import { Link } from 'react-router-dom';
import { useState } from 'react';

const BG1  = '#0F0F11';
const BD   = 'rgba(255,255,255,0.06)';
const BDM  = 'rgba(255,255,255,0.10)';
const T3   = '#52525E';
const FONT = 'Inter, DM Sans, system-ui, sans-serif';
const MONO = '"JetBrains Mono", "DM Mono", monospace';

const CARDS = [
  {
    id: 'tasks',
    label: 'Pending Tasks',
    href: '/tasks',
    grad: 'rgba(245,158,11,0.18)',
    color: '#F59E0B',
    value: 0,
    sub: 'No pending tasks',
  },
  {
    id: 'renewals',
    label: 'Upcoming Renewals',
    href: '/renewals',
    grad: 'rgba(239,68,68,0.18)',
    color: '#EF4444',
    value: 0,
    sub: 'No renewals yet',
  },
  {
    id: 'quotes',
    label: 'Active Quotes',
    href: '/submissions',
    grad: 'rgba(59,130,246,0.18)',
    color: '#3B82F6',
    value: 0,
    sub: 'No active quotes',
  },
  {
    id: 'clients',
    label: 'Active Clients',
    href: '/clients',
    grad: 'rgba(34,197,94,0.18)',
    color: '#22C55E',
    value: 0,
    sub: 'No clients yet',
  },
];

export default function StatCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
      {CARDS.map((card, i) => <StatCard key={card.id} card={card} delay={i * 0.06} />)}
    </div>
  );
}

function StatCard({ card, delay }: { card: typeof CARDS[0]; delay: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={card.href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${card.grad} 0%, ${BG1} 65%)`,
          border: `1px solid ${hovered ? BDM : BD}`,
          borderRadius: 12,
          padding: '18px 20px 16px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transform: hovered ? 'translateY(-1px)' : 'none',
          boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.4)' : 'none',
          transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
          animation: `fadeUp 0.3s ease ${delay}s both`,
          fontFamily: FONT,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Label */}
        <div style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: '0.5px',
          color: T3, textTransform: 'uppercase', marginBottom: 12,
          fontFamily: FONT,
        }}>
          {card.label}
        </div>

        {/* Big number */}
        <div style={{
          fontSize: 40, fontWeight: 300, letterSpacing: '-2px',
          lineHeight: 1, marginBottom: 8,
          fontFamily: MONO, color: card.color,
        }}>
          {card.value}
        </div>

        {/* Subtext */}
        <div style={{ fontSize: 11.5, color: T3, fontFamily: FONT }}>{card.sub}</div>
      </div>
    </Link>
  );
}
