'use client';

import { useState, useEffect, useCallback } from 'react';
import RenewalDrawer from './RenewalDrawer';

const BG1 = '#0F0F11';
const BG2 = '#141416';
const BG3 = '#1A1A1E';
const BD = 'rgba(255,255,255,0.06)';
const BDM = 'rgba(255,255,255,0.10)';
const TEXT = '#F0F0F2';
const T2 = '#8A8A96';
const T3 = '#52525E';
const BLUE = '#3B82F6';
const RED = '#EF4444';
const AMBER = '#F59E0B';
const GREEN = '#22C55E';
const FONT = 'Inter, DM Sans, system-ui, sans-serif';

interface Renewal {
  id: number;
  client_name: string;
  policy_number: string;
  expiration_date: string;
  status: string;
}

interface Summary {
  expired: number;
  critical: number;
  urgent: number;
  upcoming: number;
}

export default function RenewalPanel() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [summary, setSummary] = useState<Summary>({ expired: 0, critical: 0, urgent: 0, upcoming: 0 });
  const [timelineData, setTimelineData] = useState<number[]>(Array(60).fill(0));
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filteredRenewals, setFilteredRenewals] = useState<Renewal[]>([]);
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Deduplicate renewals by policy_number, keeping the most recent
  const deduplicate = (renewals: Renewal[]) => {
    const seen = new Map<string, Renewal>();
    renewals.forEach(r => {
      const key = r.policy_number || `renewal_${r.id}`;
      const existing = seen.get(key);
      if (!existing || new Date((r as any).created_at || 0) > new Date((existing as any).created_at || 0)) {
        seen.set(key, r);
      }
    });
    return Array.from(seen.values());
  };

  // Fetch renewals
  const fetchRenewals = useCallback(async () => {
    try {
      const response = await fetch('/api/renewals?limit=100&upcoming=true');
      if (response.ok) {
        const data = await response.json();
        const rawRenewals = data.data || [];
        const renewalsData = deduplicate(rawRenewals);
        setRenewals(renewalsData);
        calculateSummary(renewalsData);
        calculateTimeline(renewalsData);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch renewals:', error);
    }
  }, []);

  // Calculate summary stats
  const calculateSummary = (data: Renewal[]) => {
    const today = new Date();
    let expired = 0, critical = 0, urgent = 0, upcoming = 0;

    data.forEach(r => {
      const expDate = new Date(r.expiration_date);
      const daysLeft = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) expired++;
      else if (daysLeft <= 10) critical++;
      else if (daysLeft <= 20) urgent++;
      else upcoming++;
    });

    setSummary({ expired, critical, urgent, upcoming });
  };

  // Calculate 60-day timeline
  const calculateTimeline = (data: Renewal[]) => {
    const timeline = Array(60).fill(0);
    const today = new Date();

    data.forEach(r => {
      const expDate = new Date(r.expiration_date);
      const daysFromNow = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysFromNow >= 0 && daysFromNow < 60) {
        timeline[daysFromNow]++;
      }
    });

    setTimelineData(timeline);
  };

  // Filter renewals
  useEffect(() => {
    const today = new Date();
    let filtered = renewals;

    if (activeFilter === 'expired') {
      filtered = renewals.filter(r => new Date(r.expiration_date) < today);
    } else if (activeFilter === 'critical') {
      filtered = renewals.filter(r => {
        const daysLeft = Math.floor((new Date(r.expiration_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft >= 0 && daysLeft <= 10;
      });
    } else if (activeFilter === 'urgent') {
      filtered = renewals.filter(r => {
        const daysLeft = Math.floor((new Date(r.expiration_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft > 10 && daysLeft <= 20;
      });
    } else if (activeFilter === 'upcoming') {
      filtered = renewals.filter(r => {
        const daysLeft = Math.floor((new Date(r.expiration_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft > 20;
      });
    }

    setFilteredRenewals(filtered);
  }, [renewals, activeFilter]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchRenewals();
    const interval = setInterval(fetchRenewals, 60000);
    return () => clearInterval(interval);
  }, [fetchRenewals]);

  const getDaysRemaining = (date: string) => {
    const today = new Date();
    const expDate = new Date(date);
    return Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft < 0) return RED;
    if (daysLeft <= 10) return RED;
    if (daysLeft <= 20) return AMBER;
    return GREEN;
  };

  const getUrgencyPercent = (daysLeft: number) => {
    if (daysLeft < 0) return 100;
    return Math.min(100, ((60 - daysLeft) / 60) * 100);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/renewals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setRenewals(renewals.map(r => r.id === id ? { ...r, status } : r));
        if (selectedRenewal?.id === id) {
          setSelectedRenewal({ ...selectedRenewal, status });
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const response = await fetch(`/api/renewals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (response.ok) {
        setRenewals(renewals.filter(r => r.id !== id));
        setDrawerOpen(false);
      }
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/renewals/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setRenewals(renewals.filter(r => r.id !== id));
        setDrawerOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleMarkComplete = async (id: number) => {
    try {
      const response = await fetch(`/api/renewals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (response.ok) {
        setRenewals(renewals.map(r => r.id === id ? { ...r, status: 'completed' } : r));
        if (selectedRenewal?.id === id) {
          setSelectedRenewal({ ...selectedRenewal, status: 'completed' });
        }
      }
    } catch (error) {
      console.error('Failed to mark complete:', error);
    }
  };

  const handleEmailInsured = async (id: number, email: string) => {
    try {
      await fetch(`/api/renewals/${id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sent_at: new Date().toISOString() }),
      });
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  };

  const maxTimelineValue = Math.max(...timelineData, 1);

  return (
    <div style={{
      background: BG2, border: `1px solid ${BD}`,
      borderRadius: 12, overflow: 'hidden', fontFamily: FONT,
      display: 'flex', flexDirection: 'column', height: '420px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '12px 16px',
        borderBottom: `1px solid ${BD}`, gap: 8, flexShrink: 0,
      }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>Renewals (60 Days)</div>
        <span style={{
          fontSize: 10, fontWeight: 500, background: BG3, color: T3,
          padding: '1px 6px', borderRadius: 20, border: `1px solid ${BD}`,
        }}>{filteredRenewals.length} total</span>
      </div>

      {/* 60-Day Timeline */}
      <div style={{
        display: 'flex', gap: 2, padding: '8px 16px', borderBottom: `1px solid ${BD}`,
        flexShrink: 0, alignItems: 'flex-end', justifyContent: 'space-between',
        height: '36px',
      }}>
        {timelineData.map((count, day) => {
          const height = (count / maxTimelineValue) * 20 + 4;
          let color = T3;
          if (count > 0) {
            if (day <= 10) color = RED;
            else if (day <= 20) color = AMBER;
            else color = GREEN;
          }
          return (
            <div
              key={day}
              style={{
                width: '100%', height: `${height}px`, borderRadius: 2,
                background: color, opacity: count > 0 ? 1 : 0.3,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              title={`Day ${day}: ${count} renewals`}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = count > 0 ? '1' : '0.3'; }}
            />
          );
        })}
      </div>

      {/* Summary Chips */}
      <div style={{
        display: 'flex', gap: 6, padding: '10px 16px',
        borderBottom: `1px solid ${BD}`, flexShrink: 0, overflowX: 'auto',
        scrollBehavior: 'smooth',
      }}>
        {[
          { label: 'Expired', value: summary.expired, color: RED, filter: 'expired' },
          { label: 'Critical ≤10d', value: summary.critical, color: RED, filter: 'critical' },
          { label: 'Urgent ≤20d', value: summary.urgent, color: AMBER, filter: 'urgent' },
          { label: 'Upcoming', value: summary.upcoming, color: GREEN, filter: 'upcoming' },
        ].map(chip => (
          <button
            key={chip.filter}
            onClick={() => setActiveFilter(activeFilter === chip.filter ? null : chip.filter)}
            style={{
              padding: '4px 10px', fontSize: 10.5, fontWeight: 500,
              borderRadius: 6, border: `1px solid ${activeFilter === chip.filter ? chip.color : BDM}`,
              background: activeFilter === chip.filter ? `${chip.color}20` : 'transparent',
              color: activeFilter === chip.filter ? chip.color : T2,
              cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              fontFamily: FONT,
            }}
          >
            {chip.label} {chip.value > 0 && <strong>({chip.value})</strong>}
          </button>
        ))}
      </div>

      {/* Scrollable Renewals List */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
      }}>
        {filteredRenewals.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '40px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 26, opacity: 0.2, marginBottom: 8 }}>↻</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: T2 }}>No renewals</div>
            <div style={{ fontSize: 10, color: T3, marginTop: 4 }}>
              {activeFilter ? 'in this category' : 'in next 60 days'}
            </div>
          </div>
        ) : (
          filteredRenewals.map(renewal => {
            const daysLeft = getDaysRemaining(renewal.expiration_date);
            const urgencyColor = getUrgencyColor(daysLeft);
            const urgencyPercent = getUrgencyPercent(daysLeft);

            return (
              <div
                key={renewal.id}
                onClick={() => {
                  setSelectedRenewal(renewal);
                  setDrawerOpen(true);
                }}
                style={{
                  padding: '10px 16px', borderBottom: `1px solid ${BD}`,
                  transition: 'background 0.1s', cursor: 'pointer', position: 'relative',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = BG3; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                {/* Urgency progress bar */}
                <div
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '2px', background: urgencyColor, opacity: 0.6,
                    width: `${urgencyPercent}%`,
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: TEXT }}>
                    {renewal.client_name}
                  </div>
                  <div style={{ fontSize: 9.5, color: T2 }}>
                    {daysLeft < 0 ? 'Expired' : `${daysLeft}d`}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div style={{ fontSize: 9.5, color: T3 }}>
                    {renewal.policy_number || '—'} • {formatDate(renewal.expiration_date)}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setStatusDropdown(statusDropdown === renewal.id ? null : renewal.id)}
                      style={{
                        padding: '2px 8px', fontSize: 9, fontWeight: 500,
                        borderRadius: 4, border: `1px solid ${urgencyColor}20`,
                        background: `${urgencyColor}15`, color: urgencyColor,
                        cursor: 'pointer', textTransform: 'capitalize',
                        fontFamily: FONT,
                      }}
                    >
                      {renewal.status}
                    </button>

                    {statusDropdown === renewal.id && (
                      <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 2,
                        background: BG1, border: `1px solid ${BD}`, borderRadius: 6,
                        zIndex: 100, minWidth: '120px', boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                      }}>
                        {['pending', 'in_progress', 'quoted', 'cancelled'].map(s => (
                          <button
                            key={s}
                            onClick={() => {
                              setStatusDropdown(null);
                              // TODO: Call update API
                            }}
                            style={{
                              display: 'block', width: '100%', padding: '7px 12px',
                              textAlign: 'left', fontSize: 10, fontWeight: 500,
                              border: 'none', background: s === renewal.status ? BG3 : 'transparent',
                              color: s === renewal.status ? BLUE : T2,
                              cursor: 'pointer', fontFamily: FONT,
                              borderBottom: s !== 'cancelled' ? `1px solid ${BD}` : 'none',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = BG3; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = s === renewal.status ? BG3 : 'transparent'; }}
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer - Live indicator + last updated */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderTop: `1px solid ${BD}`, background: BG3,
        fontSize: 9, color: T3, flexShrink: 0, fontFamily: FONT,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%', background: GREEN, flexShrink: 0,
            animation: 'pulse 2s ease infinite',
          }} />
          <span>Live</span>
        </div>
        <span>Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <RenewalDrawer
        renewal={selectedRenewal}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={handleStatusChange}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onMarkComplete={handleMarkComplete}
        onEmailInsured={handleEmailInsured}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: ${T3};
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: ${T2};
        }
      `}</style>
    </div>
  );
}
