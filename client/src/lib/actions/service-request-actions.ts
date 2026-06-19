export const getServiceRequests = () => fetch('/api/service-requests').then(r => r.json())
export const createServiceRequest = (data: any) => fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
export const updateServiceRequest = (id: string, data: any) => fetch(`/api/service-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
