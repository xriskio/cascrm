
import { useState } from 'react';

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
  [key: string]: any;
}

interface RenewalDrawerProps {
  renewal: Renewal | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkComplete: (id: number) => void;
  onEmailInsured: (id: number, email: string) => void;
}

type Tab = 'details' | 'notes' | 'activity' | 'email';

export default function RenewalDrawer({
  renewal,
  isOpen,
  onClose,
  onStatusChange,
  onArchive,
  onDelete,
  onMarkComplete,
  onEmailInsured,
}: RenewalDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [emailBody, setEmailBody] = useState('');
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  if (!renewal) return null;

  const getDaysRemaining = () => {
    const today = new Date();
    const expDate = new Date(renewal.expiration_date);
    return Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getEmailTemplate = () => {
    const daysLeft = getDaysRemaining();
    const tone =
      daysLeft < 0 ? 'urgent'
      : daysLeft <= 10 ? 'critical'
      : daysLeft <= 20 ? 'warning'
      : 'standard';

    const salutation = `Dear ${renewal.client_name},`;
    const expiryDate = new Date(renewal.expiration_date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    let body = '';
    if (tone === 'urgent') {
      body = `Your ${renewal.policy_number} policy expires ${expiryDate} (OVERDUE).

Please contact us immediately to renew your coverage and avoid a lapse in protection.`;
    } else if (tone === 'critical') {
      body = `Your ${renewal.policy_number} policy is set to expire in ${daysLeft} days on ${expiryDate}.

Please contact us right away to renew your insurance coverage.`;
    } else if (tone === 'warning') {
      body = `This is a reminder that your ${renewal.policy_number} policy will expire on ${expiryDate}.

Please reach out at your earliest convenience to discuss renewal options.`;
    } else {
      body = `Your ${renewal.policy_number} policy will expire on ${expiryDate}.

We'd be happy to assist with your renewal. Please let us know if you have any questions.`;
    }

    return `${salutation}\n\n${body}\n\nBest regards,\nYour Insurance Team`;
  };

  const handleEmailInsured = () => {
    if (!emailBody.trim()) {
      alert('Please add a message before sending');
      return;
    }
    const email = renewal.client_email || 'client@example.com';
    const subject = encodeURIComponent(`Renewal Notice - Policy ${renewal.policy_number}`);
    const body = encodeURIComponent(emailBody);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    onEmailInsured(renewal.id, email);
    setShowEmailConfirm(false);
    setActiveTab('activity');
  };

  const getProgressSteps = () => {
    const statuses = ['pending', 'in_progress', 'quoted', 'sent_to_insured', 'completed'];
    const currentIndex = statuses.indexOf(renewal.status);
    return statuses.map((status, index) => ({
      label: status.replace(/_/g, ' '),
      isCompleted: index < currentIndex,
      isCurrent: index === currentIndex,
    }));
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '480px',
          background: BG1,
          borderLeft: `1px solid ${BD}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          boxShadow: isOpen ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${BD}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
            {renewal.client_name}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              color: T2,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Policy Info Strip */}
        <div style={{ padding: '12px 20px', background: BG2, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 10.5, color: T2 }}>
            <div>
              <div style={{ color: T3, marginBottom: 2 }}>Policy #</div>
              <div style={{ color: TEXT, fontWeight: 500 }}>{renewal.policy_number}</div>
            </div>
            <div>
              <div style={{ color: T3, marginBottom: 2 }}>Expires</div>
              <div style={{ color: TEXT, fontWeight: 500 }}>
                {new Date(renewal.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: `1px solid ${BD}`,
            flexShrink: 0,
            overflow: 'auto',
          }}
        >
          {(['details', 'notes', 'activity', 'email'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px 12px',
                fontSize: 11,
                fontWeight: 500,
                background: activeTab === tab ? BG2 : 'transparent',
                color: activeTab === tab ? BLUE : T2,
                border: 'none',
                borderBottom: activeTab === tab ? `2px solid ${BLUE}` : '1px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontFamily: FONT,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Progress Tracker */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: T3, textTransform: 'uppercase', marginBottom: 10 }}>
                  Renewal Progress
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {getProgressSteps().map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: step.isCompleted ? GREEN : step.isCurrent ? BLUE : BG3,
                          border: `1px solid ${step.isCurrent ? BLUE : BD}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: step.isCompleted || step.isCurrent ? '#fff' : T3,
                          fontWeight: 600,
                        }}
                      >
                        {step.isCompleted ? '✓' : idx + 1}
                      </div>
                      {idx < getProgressSteps().length - 1 && (
                        <div
                          style={{
                            flex: 1,
                            height: 2,
                            background: step.isCompleted ? GREEN : BD,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: T3, textTransform: 'uppercase', marginBottom: 8 }}>
                  Status
                </div>
                <select
                  value={renewal.status}
                  onChange={e => onStatusChange(renewal.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: BG2,
                    border: `1px solid ${BD}`,
                    borderRadius: 6,
                    color: TEXT,
                    fontSize: 11,
                    fontFamily: FONT,
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="quoted">Quoted</option>
                  <option value="sent_to_insured">Sent to Insured</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Carrier', value: renewal.carrier || renewal.insurance_carrier || '—' },
                  { label: 'Type', value: renewal.policy_type || '—' },
                  { label: 'Effective', value: renewal.effective_date ? new Date(renewal.effective_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—' },
                  { label: 'Premium', value: renewal.expiring_premium ? `$${Number(renewal.expiring_premium).toLocaleString()}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: BG2, padding: '10px 12px', borderRadius: 6, border: `1px solid ${BD}` }}>
                    <div style={{ fontSize: 9, color: T3, marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: 11.5, color: TEXT, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add internal notes... (Cmd+Enter to save)"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: BG2,
                  border: `1px solid ${BD}`,
                  borderRadius: 6,
                  color: TEXT,
                  fontFamily: FONT,
                  fontSize: 11,
                  resize: 'none',
                  minHeight: 200,
                }}
              />
              <button
                onClick={() => {
                  console.log('Saving note:', notes);
                  setNotes('');
                }}
                style={{
                  padding: '8px 12px',
                  background: BLUE,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Save Note
              </button>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 10.5, color: T2 }}>Activity log coming soon</div>
              <div style={{ fontSize: 10, color: T3, lineHeight: 1.6 }}>
                Events like status changes, emails sent, and notes will appear here.
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                placeholder="Compose email to insured..."
                style={{
                  flex: 1,
                  padding: '12px',
                  background: BG2,
                  border: `1px solid ${BD}`,
                  borderRadius: 6,
                  color: TEXT,
                  fontFamily: FONT,
                  fontSize: 11,
                  resize: 'none',
                  minHeight: 200,
                }}
              />
              <button
                onClick={() => {
                  setEmailBody(getEmailTemplate());
                }}
                style={{
                  padding: '6px 10px',
                  background: BG2,
                  color: BLUE,
                  border: `1px solid ${BLUE}`,
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Load Template
              </button>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${BD}`,
            display: 'flex',
            gap: 8,
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          {activeTab === 'email' ? (
            <button
              onClick={() => handleEmailInsured()}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: FONT,
              }}
            >
              Send Email
            </button>
          ) : (
            <>
              <button
                onClick={() => onMarkComplete(renewal.id)}
                style={{
                  padding: '8px 12px',
                  background: BG2,
                  color: GREEN,
                  border: `1px solid ${GREEN}`,
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                ✓ Complete
              </button>
              <button
                onClick={() => setActiveTab('email')}
                style={{
                  padding: '8px 12px',
                  background: BG2,
                  color: BLUE,
                  border: `1px solid ${BLUE}`,
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                ✉ Email
              </button>
              <button
                onClick={() => setShowArchiveConfirm(true)}
                style={{
                  padding: '8px 12px',
                  background: BG2,
                  color: AMBER,
                  border: `1px solid ${AMBER}`,
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                📦 Archive
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: '8px 12px',
                  background: BG2,
                  color: RED,
                  border: `1px solid ${RED}`,
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                🗑 Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: BG1,
              border: `1px solid ${BD}`,
              borderRadius: 8,
              padding: '20px',
              maxWidth: 300,
              fontFamily: FONT,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Delete renewal?</div>
            <div style={{ fontSize: 11, color: T2, marginBottom: 16, lineHeight: 1.5 }}>
              This action cannot be undone. The renewal record will be permanently deleted.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: BG2,
                  color: T2,
                  border: `1px solid ${BD}`,
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(renewal.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: RED,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={() => setShowArchiveConfirm(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: BG1,
              border: `1px solid ${BD}`,
              borderRadius: 8,
              padding: '20px',
              maxWidth: 300,
              fontFamily: FONT,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Archive renewal?</div>
            <div style={{ fontSize: 11, color: T2, marginBottom: 16, lineHeight: 1.5 }}>
              The renewal will be moved to the archived section and hidden from the active list.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowArchiveConfirm(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: BG2,
                  color: T2,
                  border: `1px solid ${BD}`,
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onArchive(renewal.id);
                  setShowArchiveConfirm(false);
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: AMBER,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
