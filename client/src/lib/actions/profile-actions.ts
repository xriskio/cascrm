import { profileApi } from '@/lib/api-client'

export const updateProfile = (data: any) => profileApi.update(data)
export const getProfile = () => profileApi.get()
export const changePassword = (...args: any[]) => fetch('/api/stub', { method: 'POST' }).then(r => r.json())
export const updateNotificationPreferences = (...args: any[]) => fetch('/api/stub', { method: 'POST' }).then(r => r.json())
export const getAllUsers = (...args: any[]) => fetch('/api/stub', { method: 'POST' }).then(r => r.json())
export const createUser = (...args: any[]) => fetch('/api/stub', { method: 'POST' }).then(r => r.json())
export const deleteUser = (...args: any[]) => fetch('/api/stub', { method: 'POST' }).then(r => r.json())
export const updateUserRole = (...args: any[]) => fetch('/api/stub', { method: 'POST' }).then(r => r.json())
