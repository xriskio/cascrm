export const getClientFiles = (clientId: string) => fetch(`/api/clients/${clientId}/files`).then(r => r.json())
export const uploadClientFile = (clientId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return fetch(`/api/clients/${clientId}/files`, { method: 'POST', body: form }).then(r => r.json())
}
export const deleteClientFile = (clientId: string, fileId: string) => fetch(`/api/clients/${clientId}/files/${fileId}`, { method: 'DELETE' }).then(r => r.json())
