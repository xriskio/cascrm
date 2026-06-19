export const getResources = () => fetch('/api/agency-resources').then(r => r.json())
export const createResource = (data: any) => fetch('/api/agency-resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
export const updateResource = (id: string, data: any) => fetch(`/api/agency-resources/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
export const deleteResource = (id: string) => fetch(`/api/agency-resources/${id}`, { method: 'DELETE' }).then(r => r.json())
