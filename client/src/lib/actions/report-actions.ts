export const getReportData = (range?: string) => fetch(`/api/reports?range=${range || '90'}`).then(r => r.json())
export const generateReport = (type: string, params: any) => fetch('/api/reports/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, ...params }) }).then(r => r.json())
export const getReportStats = (...args: any[]) => fetch('/api/stub', { method: 'POST' }).then(r => r.json())
