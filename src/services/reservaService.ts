import { api } from './api'
import type { AtualizarReservaRequest, CriarReservaRequest, ReservaResponse } from '../types/api'

export async function listarMinhasReservas(): Promise<ReservaResponse[]> {
  const { data } = await api.get<ReservaResponse[]>('/reservas/minhas')
  return data
}

export async function listarTodasReservas(): Promise<ReservaResponse[]> {
  const { data } = await api.get<ReservaResponse[]>('/reservas')
  return data
}

export async function listarHistorico(): Promise<ReservaResponse[]> {
  const { data } = await api.get<ReservaResponse[]>('/reservas/minhas/historico')
  return data
}

export async function criarReserva(dados: CriarReservaRequest): Promise<ReservaResponse> {
  const { data } = await api.post<ReservaResponse>('/reservas', dados)
  return data
}

export async function atualizarReserva(
  id: number,
  dados: AtualizarReservaRequest,
): Promise<void> {
  await api.put(`/reservas/${id}`, dados)
}

export async function cancelarReserva(id: number): Promise<void> {
  await api.patch(`/reservas/${id}/cancelar`)
}
