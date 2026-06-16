'use client';

import { useState, useEffect, useCallback } from 'react';

const POLICY_TYPES = [
  'General Liability', 'Commercial Property', 'Commercial Auto',
  'Dwelling Fire', 'Workers Comp', 'Commercial Umbrella', 'BOP',
  'Homeowners', "Renter's Policy",
];

interface NewSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: SubmissionData) => void;
}

export interface SubmissionData {
  type: string;
  clientName: string;
  description: string;
  dueDate: string;
  priority: string;
  policyType: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 11px',
  border: '1px solid var(--border-med)',
  borderRadius: 'var(--radius)',
  fontFamily: 'var(--font)',
  fontSize: 13,
  color: 'var(--text)',
  background: 'var(--surface)',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '0 18px', height: 36,
  background: 'var(--text)', color: '#fff',
  border: 'none', borderRadius: 'var(--radius)',
  fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500,
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '0 18px', height: 36,
  background: 'transparent', color: 'var(--text-2)',
  border: '1px solid var(--border-med)', borderRadius: 'var(--radius)',
  fontFamily: 'var(--font)', fontSize: 13,
  cursor: 'pointer',
};

export default function NewSubmissionModal({ open, onClose, onSubmit }: NewSubmissionModalProps) {
  const [form, setForm] = useState<SubmissionData>({
    type: 'Submission',
    clientName: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    policyType: 'General Liability',
  });
  const [error, setError] = useState('');

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, handleKey]);

  if (!open) return null;

  const set = (field: keyof SubmissionData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.clientName.trim()) {
      setError('Client name is required');
      return;
    }
    setError('');
    onSubmit?.(form);
    onClose();
    setForm({ type: 'Submission', clientName: '', description: '', dueDate: '', priority: 'Medium', policyType: 'General Liability' });
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200,
          backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.15s ease',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            width: 440, maxWidth: '95vw',
            boxShadow: 'var(--shadow-lg)',
            animation: 'scaleIn 0.18s ease',
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px' }}>
              New Submission / Task
            </div>
            <CloseBtn onClick={onClose} />
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--red-bg)', color: 'var(--red)',
                fontSize: 12.5, fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <FormField label="Type">
              <select style={inputStyle} value={form.type} onChange={set('type')}>
                <option>Submission</option>
                <option>Task</option>
                <option>Quote Request</option>
                <option>Renewal Follow-up</option>
              </select>
            </FormField>

            <FormField label="Client Name">
              <input
                type="text"
                style={{ ...inputStyle, borderColor: error && !form.clientName ? 'var(--red)' : undefined }}
                placeholder="Search or enter client name…"
                value={form.clientName}
                onChange={set('clientName')}
                autoFocus
              />
            </FormField>

            <FormField label="Description">
              <input
                type="text"
                style={inputStyle}
                placeholder="Brief description…"
                value={form.description}
                onChange={set('description')}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FormField label="Due Date">
                <input type="date" style={inputStyle} value={form.dueDate} onChange={set('dueDate')} />
              </FormField>
              <FormField label="Priority">
                <select style={inputStyle} value={form.priority} onChange={set('priority')}>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
              </FormField>
            </div>

            <FormField label="Policy Type">
              <select style={inputStyle} value={form.policyType} onChange={set('policyType')}>
                {POLICY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
          </div>

          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: 8, justifyContent: 'flex-end',
          }}>
            <button onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
            <button onClick={handleSubmit} style={primaryBtnStyle}>Create</button>
          </div>
        </div>
      </div>
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{
        fontSize: 11.5, fontWeight: 500, color: 'var(--text-2)',
        letterSpacing: '0.2px',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        width: 28, height: 28,
        borderRadius: 8, border: 'none',
        background: hovered ? 'var(--surface2)' : 'transparent',
        cursor: 'pointer', fontSize: 18, lineHeight: 1,
        color: 'var(--text-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.12s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      ×
    </button>
  );
}
