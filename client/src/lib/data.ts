import type { Task, Activity } from '@/types';

export const INITIAL_TASKS: Task[] = [];

export const ACTIVITY_FEED: Activity[] = [];

export const NAV_ITEMS = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard',  icon: '⊞', href: '/dashboard' },
      { label: 'My Tasks',   icon: '✓', href: '/tasks',     badge: '', badgeVariant: 'amber' as const },
      { label: 'Reports',    icon: '📊', href: '/reports'   },
    ],
  },
  {
    section: 'Insurance',
    items: [
      { label: 'Renewals',           icon: '↻',  href: '/renewals',           badge: '', badgeVariant: 'red' as const },
      { label: 'Submissions',        icon: '📋', href: '/submissions'         },
      { label: 'Quotes',             icon: '💲', href: '/quotes'              },
      { label: 'Market Submissions', icon: '🏛',  href: '/market-submissions'  },
    ],
  },
  {
    section: 'Clients',
    items: [
      { label: 'Clients',   icon: '👥', href: '/clients'    },
      { label: 'Leads',     icon: '🎯', href: '/leads'      },
      { label: 'Call Log',  icon: '📞', href: '/call-log'   },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Service Requests',   icon: '🔧', href: '/service-requests'  },
      { label: 'Inspections',        icon: '🔍', href: '/inspections'       },
      { label: 'Missing Documents',  icon: '📁', href: '/missing-documents' },
      { label: 'Carrier Contacts',   icon: '🏢', href: '/carrier-contacts'  },
    ],
  },
  {
    section: 'Sync & Admin',
    items: [
      { label: 'QQCatalyst Sync', icon: '⟳', href: '/admin/qqcatalyst' },
      { label: 'Settings',        icon: '⚙',  href: '/settings'         },
    ],
  },
];
