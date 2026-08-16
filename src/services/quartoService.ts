import { api } from './api'
import type { AtualizarQuartoRequest, CriarQuartoRequest, QuartoResponse } from '../types/api'

export async function listarQuartos(): Promise<QuartoResponse[]> {
  const { data } = await api.get<QuartoResponse[]>('/quartos')
  return data
}

export async function criarQuarto(dados: CriarQuartoRequest): Promise<QuartoResponse> {
  const { data } = await api.post<QuartoResponse>('/quartos', dados)
  return data
}

export async function atualizarQuarto(id: number, dados: AtualizarQuartoRequest): Promise<void> {
  await api.put(`/quartos/${id}`, dados)
}

export async function excluirQuarto(id: number): Promise<void> {
  await api.delete(`/quartos/${id}`)
}
