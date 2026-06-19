export const simpleDelete = (table: string, id: string) => fetch(`/api/${table}/${id}`, { method: 'DELETE' }).then(r => r.json())
export const deleteResource = (...args: any[]) => fetch('/api/stub', { method: 'POST' }).then(r => r.json())
