'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const BG='#0C0C0E',BG2='#141416',BG3='#1E1E24',BD='rgba(200,200,210,0.14)',TEXT='#F0F0F2',T2='#C8C8D4',T3='#8888A0',BLUE='#3B82F6',FONT="Inter,DM Sans,system-ui,sans-serif"

const THEMES = [
  { id: 'light', label: 'Light', icon: '☀️', desc: 'Light background, dark text' },
  { id: 'dark',  label: 'Dark',  icon: '🌑', desc: 'Black background, white text (Cursor style)' },
  { id: 'system',label: 'System',icon: '💻', desc: 'Follows your OS preference' },
]

export default function AppearanceSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div style={{ fontFamily: FONT, color: TEXT }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: TEXT }}>Appearance</h2>
        <p style={{ fontSize: 13, color: T3, margin: 0 }}>Choose how InsureTrack looks. Saved automatically per browser.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {THEMES.map(t => {
          const active = theme === t.id
          return (
            <div
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                background: active ? '#1E3A5F' : BG2,
                border: `1.5px solid ${active ? BLUE : BD}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active)(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.4)' }}
              onMouseLeave={e => { if (!active)(e.currentTarget as HTMLDivElement).style.borderColor = BD }}
            >
              <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#60A5FA' : TEXT }}>{t.label}</div>
                <div style={{ fontSize: 12, color: T3, marginTop: 2 }}>{t.desc}</div>
              </div>
              {active && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {resolvedTheme && (
        <p style={{ fontSize: 11, color: T3, marginTop: 12 }}>
          Currently showing: <strong style={{ color: T2 }}>{resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode'}</strong>
        </p>
      )}
    </div>
  )
}
