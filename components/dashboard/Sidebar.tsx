'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BG1  = '#0F0F11';
const BG2  = '#141416';
const BD   = 'rgba(255,255,255,0.06)';
const TEXT = '#F0F0F2';
const T2   = '#8A8A96';
const T3   = '#52525E';
const FONT = 'Inter, DM Sans, system-ui, sans-serif';

const NAV = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard',  icon: '⊞', href: '/dashboard'  },
      { label: 'My Tasks',   icon: '✓', href: '/tasks'       },
      { label: 'Reports',    icon: '◫', href: '/reports'     },
    ],
  },
  {
    section: 'Insurance',
    items: [
      { label: 'Renewals',           icon: '↻', href: '/renewals'           },
      { label: 'Submissions',        icon: '◻', href: '/submissions'        },
      { label: 'Quotes',             icon: '$', href: '/quotes'              },
      { label: 'Market Submissions', icon: '⊜', href: '/market-submissions' },
    ],
  },
  {
    section: 'Clients',
    items: [
      { label: 'Clients',  icon: '◉', href: '/clients'  },
      { label: 'Leads',    icon: '⊹', href: '/leads'    },
      { label: 'Call Log', icon: '☎', href: '/call-log' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Service Requests',  icon: '⚙', href: '/service-requests'  },
      { label: 'Inspections',       icon: '◎', href: '/inspections'       },
      { label: 'Documents',         icon: '◻', href: '/documents'         },
      { label: 'Carrier Contacts',  icon: '⊡', href: '/carrier-contacts'  },
    ],
  },
  {
    section: 'Sync & Admin',
    items: [
      { label: 'QQCatalyst Sync', icon: '⟳', href: '/admin/qqcatalyst' },
      { label: 'Settings',        icon: '⚙', href: '/settings'          },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 210, minWidth: 210,
      background: BG1, borderRight: `1px solid ${BD}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: FONT,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: `1px solid ${BD}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, background: TEXT, borderRadius: 8, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.4px', color: TEXT }}>InsureTrack</div>
          <div style={{ fontSize: 10, color: T3, marginTop: 1 }}>Casurance AI</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(group => (
          <div key={group.section}>
            <div style={{
              fontSize: 9.5, fontWeight: 600, letterSpacing: '0.9px',
              textTransform: 'uppercase', color: T3,
              padding: '10px 8px 4px', marginTop: 4,
              fontFamily: FONT,
            }}>
              {group.section}
            </div>
            {group.items.map(item => {
              const active = pathname === item.href ||
                (item.href !== '/dashboard' && item.href !== '/' && pathname.startsWith(item.href));
              return (
                <NavItem key={item.href} item={item} active={active} />
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${BD}` }}>
        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              borderRadius: 8, cursor: 'pointer', transition: 'background 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = BG2; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: TEXT, color: '#0A0A0B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, flexShrink: 0,
            }}>
              YN
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: TEXT, fontFamily: FONT }}>Your Name</div>
              <div style={{ fontSize: 10, color: T3, fontFamily: FONT }}>Casurance Agency</div>
            </div>
            <span style={{ marginLeft: 'auto', color: T3, fontSize: 12 }}>⌄</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function NavItem({ item, active }: { item: { label: string; icon: string; href: string }; active: boolean }) {
  return (
    <Link href={item.href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 8,
          fontSize: 13, fontWeight: active ? 500 : 400,
          background: active ? TEXT : 'transparent',
          color: active ? '#0A0A0B' : T2,
          transition: 'background 0.12s, color 0.12s',
          fontFamily: FONT,
        }}
        onMouseEnter={e => {
          if (!active) {
            (e.currentTarget as HTMLDivElement).style.background = BG2;
            (e.currentTarget as HTMLDivElement).style.color = TEXT;
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            (e.currentTarget as HTMLDivElement).style.color = T2;
          }
        }}
      >
        <span style={{ width: 16, textAlign: 'center', flexShrink: 0, fontSize: 14 }}>{item.icon}</span>
        {item.label}
      </div>
    </Link>
  );
}
