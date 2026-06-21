'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

const BG2='#141416',BG3='#1E1E24',BD='rgba(200,200,210,0.18)',TEXT='#F0F0F2',T3='#8888A0',BLUE='#3B82F6',FONT="Inter,DM Sans,system-ui,sans-serif"

export default function UserMenu() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setAppearanceOpen(false) } }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  if (!mounted) return null

  return (
    <div ref={ref} style={{ position: 'relative', fontFamily: FONT }}>
      <button onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: open ? BG3 : 'transparent', border: '1px solid ' + (open ? BD : 'transparent'), borderRadius: 8, cursor: 'pointer', color: TEXT, fontSize: 13 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3B82F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>W</div>
        <span style={{ fontSize: 12, color: '#C8C8D4' }}>wael</span>
        <span style={{ color: T3, fontSize: 10 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 200, background: BG2, border: '1px solid ' + BD, borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.7)', zIndex: 400, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid ' + BD }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>wael@casurance.com</div>
            <div style={{ fontSize: 11, color: T3 }}>Administrator</div>
          </div>
          <div style={{ padding: '6px 0' }}>
            {[
              { label: 'Profile', href: '/profile' },
              { label: 'Settings', href: '/settings' },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '8px 14px', fontSize: 13, color: TEXT, cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = BG3 }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                  {item.label}
                </div>
              </Link>
            ))}
            <div style={{ position: 'relative' }}>
              <div style={{ padding: '8px 14px', fontSize: 13, color: TEXT, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setAppearanceOpen(v => !v)}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = BG3 }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                <span>Appearance</span>
                <span style={{ fontSize: 11, color: '#3B82F6', fontWeight: 500 }}>{theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'} ›</span>
              </div>
              {appearanceOpen && (
                <div style={{ position: 'absolute', right: '100%', top: 0, width: 160, background: BG2, border: '1px solid ' + BD, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.7)', zIndex: 401 }}>
                  {[{ id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }, { id: 'system', label: 'System' }].map(t => (
                    <div key={t.id} onClick={() => { setTheme(t.id); setOpen(false); setAppearanceOpen(false) }}
                      style={{ padding: '9px 14px', fontSize: 13, color: theme === t.id ? '#60A5FA' : TEXT, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: theme === t.id ? 500 : 400 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = BG3 }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                      {t.label}
                      {theme === t.id && <span style={{ color: '#3B82F6' }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ borderTop: '1px solid ' + BD, margin: '4px 0' }} />
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '8px 14px', fontSize: 13, color: '#F87171', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(248,113,113,0.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                Log Out
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
