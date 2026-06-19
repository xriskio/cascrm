// Client-side API helper - wraps all server calls
const base = '/api'

async function request<T = any>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// Clients
export const clientsApi = {
  list: () => request('/clients'),
  get: (id: string) => request(`/clients/${id}`),
  create: (data: any) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/clients/${id}`, { method: 'DELETE' }),
}

// Renewals
export const renewalsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/renewals${qs}`)
  },
  get: (id: string) => request(`/renewals/${id}`),
  create: (data: any) => request('/renewals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/renewals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/renewals/${id}`, { method: 'DELETE' }),
  bulkDelete: (renewalIds: string[]) => request('/renewals/bulk-delete', { method: 'POST', body: JSON.stringify({ renewalIds }) }),
  notify: (renewalId: string, type: string) => request('/renewals/notify', { method: 'POST', body: JSON.stringify({ renewalId, type }) }),
  getStatusHistory: (id: string) => request(`/renewals/${id}/status-history`),
  updateStatus: (id: string, status: string, notes?: string) => request(`/renewals/${id}`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  updateRemarketing: (id: string, companies: any[]) => request(`/renewals/${id}`, { method: 'PATCH', body: JSON.stringify({ remarketing_companies: companies }) }),
}

// Renewal Workflows
export const workflowsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/renewal-workflows${qs}`)
  },
  get: (id: string) => request(`/renewal-workflows/${id}`),
  create: (data: any) => request('/renewal-workflows', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/renewal-workflows/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getTasks: (id: string) => request(`/renewal-workflows/${id}/tasks`),
  createTask: (id: string, data: any) => request(`/renewal-workflows/${id}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (workflowId: string, taskId: string, data: any) => request(`/renewal-workflows/${workflowId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (workflowId: string, taskId: string) => request(`/renewal-workflows/${workflowId}/tasks/${taskId}`, { method: 'DELETE' }),
  notify: (workflowId: string, type: string, message?: string) => request(`/renewal-workflows/${workflowId}/notify`, { method: 'POST', body: JSON.stringify({ notification_type: type, custom_message: message }) }),
  getNotifications: (workflowId: string) => request(`/renewal-workflows/${workflowId}/notify`),
}

// Leads
export const leadsApi = {
  list: () => request('/leads'),
  get: (id: string) => request(`/leads/${id}`),
  create: (data: any) => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/leads/${id}`, { method: 'DELETE' }),
}

// Tasks
export const tasksApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/tasks${qs}`)
  },
  get: (id: string) => request(`/tasks/${id}`),
  create: (data: any) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/tasks/${id}`, { method: 'DELETE' }),
  updateStatus: (id: string, status: string) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  archive: (id: string) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'archived' }) }),
  getStats: () => request('/tasks/stats'),
  getMine: () => request('/tasks?assigned=me'),
}

// Quotes
export const quotesApi = {
  list: () => request('/quotes'),
  get: (id: string) => request(`/quotes/${id}`),
  create: (data: any) => request('/quotes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/quotes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/quotes/${id}`, { method: 'DELETE' }),
}

// Dashboard
export const dashboardApi = {
  stats: () => request('/dashboard/stats'),
  renewals: () => request('/dashboard/renewals'),
}

// Search
export const searchApi = {
  search: (query: string) => request('/search', { method: 'POST', body: JSON.stringify({ query }) }),
}

// Profile
export const profileApi = {
  get: () => request('/profile'),
  update: (data: any) => request('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: any) => request('/profile/password', { method: 'POST', body: JSON.stringify(data) }),
}

// Market Submissions
export const marketSubmissionsApi = {
  list: () => request('/market-submissions'),
  get: (id: string) => request(`/market-submissions/${id}`),
  create: (data: any) => request('/market-submissions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/market-submissions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/market-submissions/${id}`, { method: 'DELETE' }),
}
