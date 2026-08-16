import { api } from './api'
import type { AtualizarHotelRequest, CriarHotelRequest, HotelResponse } from '../types/api'

export async function listarHoteis(): Promise<HotelResponse[]> {
  const { data } = await api.get<HotelResponse[]>('/hoteis')
  return data
}

export async function criarHotel(dados: CriarHotelRequest): Promise<HotelResponse> {
  const { data } = await api.post<HotelResponse>('/hoteis', dados)
  return data
}

export async function atualizarHotel(id: number, dados: AtualizarHotelRequest): Promise<void> {
  await api.put(`/hoteis/${id}`, dados)
}

export async function excluirHotel(id: number): Promise<void> {
  await api.delete(`/hoteis/${id}`)
}
