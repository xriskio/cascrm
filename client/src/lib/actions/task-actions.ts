import { tasksApi } from '@/lib/api-client'

export const createTask = (data: any) => tasksApi.create(data)
export const updateTask = (id: string, data: any) => tasksApi.update(id, data)
export const getMyTasks = () => tasksApi.getMine()
export const getTaskStats = () => tasksApi.getStats()
export const updateTaskStatus = (id: string, status: string) => tasksApi.updateStatus(id, status)
export const archiveTask = (id: string) => tasksApi.archive(id)
export const deleteTask = (id: string) => tasksApi.delete(id)
