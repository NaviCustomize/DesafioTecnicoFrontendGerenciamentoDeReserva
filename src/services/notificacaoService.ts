import { api } from './api'
import type { NotificacaoResponse } from '../types/api'

export async function listarNotificacoes(): Promise<NotificacaoResponse[]> {
  const { data } = await api.get<NotificacaoResponse[]>('/notificacoes')
  return data
}
