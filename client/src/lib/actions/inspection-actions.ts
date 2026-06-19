export const getInspections = () => fetch('/api/inspections').then(r => r.json())
export const createInspection = (data: any) => fetch('/api/inspections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
export const updateInspection = (id: string, data: any) => fetch(`/api/inspections/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
export const getInspectionStats = () => fetch('/api/inspections/stats').then(r => r.json())
