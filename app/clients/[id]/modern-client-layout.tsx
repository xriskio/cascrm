"use client"

import type React from "react"

interface ModernClientLayoutProps {
  children: React.ReactNode
  client?: {
    id: string
    name: string
    email?: string
    phone?: string
    status?: string
  }
}

export default function ModernClientLayout({ children, client }: ModernClientLayoutProps) {
  return (
    <div className="modern-client-container">
      {client && (
        <div className="bg-card border-b border-border p-4">
          <h1 className="text-2xl font-bold">{client.name}</h1>
          {client.email && <p className="text-muted-foreground">{client.email}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
