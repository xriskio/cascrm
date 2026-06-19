"use client"

interface ModernDetailsPageProps {
  clientId?: string
  client?: {
    id: string
    name: string
    email?: string
    phone?: string
    address?: string
  }
}

export default function ModernDetailsPage({ clientId, client }: ModernDetailsPageProps) {
  return (
    <div className="modern-details-page">
      <h1 className="text-2xl font-bold mb-4">Details for client {clientId || client?.id}</h1>
      {client && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <p className="text-foreground">{client.name}</p>
          </div>
          {client.email && (
            <div>
              <label className="block text-sm font-medium">Email</label>
              <p className="text-foreground">{client.email}</p>
            </div>
          )}
          {client.phone && (
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <p className="text-foreground">{client.phone}</p>
            </div>
          )}
          {client.address && (
            <div>
              <label className="block text-sm font-medium">Address</label>
              <p className="text-foreground">{client.address}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
