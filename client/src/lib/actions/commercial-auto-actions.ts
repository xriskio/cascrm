export const getVehicles = (submissionId: string) => fetch(`/api/submissions/${submissionId}/vehicles`).then(r => r.json())
export const addVehicle = (submissionId: string, data: any) => fetch(`/api/submissions/${submissionId}/vehicles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
export const updateVehicle = (id: string, data: any) => fetch(`/api/vehicles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
export const deleteVehicle = (id: string) => fetch(`/api/vehicles/${id}`, { method: 'DELETE' }).then(r => r.json())
