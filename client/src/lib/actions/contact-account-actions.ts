export const getContactAccounts = () => fetch('/api/contacts').then(r => r.json())
export const updateContactAccount = (id: string, data: any) => fetch(`/api/contacts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
