type Props = {
  client: any
}

export default function ClientDetailView({ client }: Props) {
  return (
    <div>
      <h1>{client.name}</h1>
      {/* render other details */}
      <div>Email: {client.email}</div>
      <div>Phone: {client.phone}</div>
    </div>
  )
}
