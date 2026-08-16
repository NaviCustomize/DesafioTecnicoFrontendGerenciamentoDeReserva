import { api } from './api'
import type { LoginRequest, LoginResponse } from '../types/api'

export async function login(dados: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', dados)
  return data
}
