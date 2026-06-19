'use client';

import { useState } from 'react';
import CopilotPanel from '@/components/ai/CopilotPanel';

const BLUE = '#3B82F6';

export default function CopilotLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="AI Copilot"
        style={{
          position: 'fixed', right: 22, bottom: 22, zIndex: 900,
          height: 48, padding: '0 18px', borderRadius: 24,
          background: BLUE, color: '#fff', border: 'none',
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          fontFamily: 'Inter, DM Sans, system-ui, sans-serif', fontSize: 13.5, fontWeight: 600,
          boxShadow: '0 8px 28px rgba(59,130,246,0.45)',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
        AI Copilot
      </button>
      <CopilotPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
