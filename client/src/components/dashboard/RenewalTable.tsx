
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BG1  = '#0F0F11';
const BG2  = '#141416';
const BG3  = '#1A1A1E';
const BD   = 'rgba(255,255,255,0.06)';
const BDM  = 'rgba(255,255,255,0.10)';
const TEXT = '#F0F0F2';
const T2   = '#8A8A96';
const T3   = '#52525E';
const BLUE = '#3B82F6';
const RED  = '#EF4444';
const AMBER = '#F59E0B';
const GREEN = '#22C55E';
const BLUE_BG = 'rgba(59,130,246,0.08)';
const FONT = 'Inter, DM Sans, system-ui, sans-serif';

type Filter = 'All' | 'Urgent' | 'Pending' | 'Quoted';
const FILTERS: Filter[] = ['All', 'Urgent', 'Pending', 'Quoted'];

interface Renewal {
  id: number;
  client_name: string;
  policy_number: string;
  expiration_date: string;
  status: string;
}

export default function RenewalTable() {
  const [filter, setFilter] = useState<Filter>('All');
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    try {
      const response = await fetch('/api/renewals?limit=10&upcoming=true');
      if (response.ok) {
        const data = await response.json();
        setRenewals(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch renewals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'urgent') return RED;
    if (status === 'pending') return AMBER;
    if (status === 'quoted') return GREEN;
    return T2;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

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
        <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>Upcoming Renewals</div>
        <span style={{
          fontSize: 10, fontWeight: 500,
          background: BG3, color: T3, padding: '1px 6px',
          borderRadius: 20, border: `1px solid ${BD}`,
        }}>{renewals.length} total</span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Pill Tabs */}
          <div style={{
            display: 'flex', background: BG3, borderRadius: 6,
            padding: 2, gap: 1, border: `1px solid ${BD}`,
          }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '3px 8px', fontSize: 10.5, fontWeight: 500, borderRadius: 4,
                  border: filter === f ? `1px solid ${BDM}` : 'none',
                  background: filter === f ? '#202026' : 'transparent',
                  cursor: 'pointer', color: filter === f ? TEXT : T3,
                  fontFamily: FONT, transition: 'all 0.1s',
                }}
              >{f}</button>
            ))}
          </div>
          <a href="/renewals" style={{
            fontSize: 11, color: BLUE, cursor: 'pointer', padding: '3px 7px',
            borderRadius: 5, fontWeight: 500, textDecoration: 'none',
            background: 'transparent', fontFamily: FONT,
          }}>View all →</a>
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 120px 100px 110px 36px',
        padding: '8px 18px', background: BG3,
        fontSize: 10, fontWeight: 600, letterSpacing: '0.6px',
        textTransform: 'uppercase', color: T3,
      }}>
        <span>Client</span>
        <span>Policy ID</span>
        <span>Expires</span>
        <span>Status</span>
        <span />
      </div>

      {/* Rows or empty state */}
      {renewals.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 26, opacity: 0.2, marginBottom: 2 }}>↻</div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: T2, fontFamily: FONT }}>No renewals yet</div>
          <div style={{ fontSize: 11, color: T3, maxWidth: 260, lineHeight: 1.6, fontFamily: FONT }}>
            Add your first renewal or sync from QQCatalyst to start tracking expiring policies.
          </div>
        </div>
      ) : (
        renewals.map(renewal => (
          <div
            key={renewal.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 100px 110px 36px',
              padding: '10px 18px',
              borderBottom: `1px solid ${BD}`,
              alignItems: 'center',
              fontSize: 11.5,
              color: TEXT,
              transition: 'background 0.1s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = BG3; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <span>{renewal.client_name}</span>
            <span style={{ color: T2 }}>{renewal.policy_number || '—'}</span>
            <span style={{ color: T2 }}>{formatDate(renewal.expiration_date)}</span>
            <span style={{ color: getStatusColor(renewal.status), textTransform: 'capitalize' }}>
              {renewal.status}
            </span>
            <div style={{ textAlign: 'center', color: T2 }}>→</div>
          </div>
        ))
      )}

      {/* Footer add row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
          borderTop: `1px solid ${BD}`, fontSize: 11.5, color: T3,
          cursor: 'pointer', background: 'transparent', transition: 'background 0.1s, color 0.1s',
          fontFamily: FONT,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = BG3; (e.currentTarget as HTMLDivElement).style.color = T2; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = T3; }}
      >
        + Add renewal
      </div>
    </div>
  );
}
