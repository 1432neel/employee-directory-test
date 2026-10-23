import axios from 'axios'

export interface Employee {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

export interface EmployeeInput {
  name: string
  email: string
  role: string
}

interface ApiResponse<T> {
  data: T
  message?: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/employee-directory-test/backend/employees',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

export async function getEmployees(): Promise<Employee[]> {
  const response = await api.get<ApiResponse<Employee[]>>('')
  return response.data.data
}

export async function createEmployee(payload: EmployeeInput): Promise<Employee> {
  const response = await api.post<ApiResponse<Employee>>('', payload)
  return response.data.data
}

export async function updateEmployee(id: number, payload: EmployeeInput): Promise<Employee> {
  const response = await api.put<ApiResponse<Employee>>('', payload, { params: { id } })
  return response.data.data
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete('', { params: { id } })
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || 'Could not connect to the API. Check that Apache and MySQL are running.'
  }
  return 'Something went wrong. Please try again.'
}
