export type RoleUsuario = 'User' | 'Admin'

export type StatusReserva = 'Pendente' | 'Confirmada' | 'Cancelada' | 'Finalizada'

export type StatusQuarto = 'Disponivel' | 'Reservado'

export type TipoQuarto = 'Standard' | 'Luxo' | 'SuiteMaster'

export interface UsuarioResponse {
  id: number
  nome: string

  sobrenome: string
  email: string
  role: RoleUsuario
}

export interface UsuarioAdminResponse {
  id: number
  nome: string
  sobrenome: string
  email: string
  role: RoleUsuario
  ativo: boolean
  inativoDesde: string | null
}

export interface CriarUsuarioRequest {
  nome: string
  sobrenome: string
  email: string
  senha: string
}

export interface AtualizarUsuarioRequest {
  nome: string
  sobrenome: string
  email: string
}

export interface AlterarSenhaRequest {
  senhaAtual: string
  novaSenha: string
}

export interface ConfirmarSenhaRequest {
  senha: string
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  usuarioId: number
  nome: string
  sobrenome: string
  role: RoleUsuario
}

export interface HotelResponse {
  id: number
  nome: string
  localizacao: string
  descricao: string | null
}

export interface CriarHotelRequest {
  nome: string
  localizacao: string
  descricao: string | null
}

export type AtualizarHotelRequest = CriarHotelRequest

export interface CriarQuartoRequest {
  hotelId: number
  numero: number
  tipo: TipoQuarto
  precoPorNoite: number
}

export interface AtualizarQuartoRequest {
  numero: number
  tipo: TipoQuarto
  precoPorNoite: number
}

export interface QuartoResponse {
  id: number
  hotelId: number
  numero: number
  tipo: TipoQuarto
  precoPorNoite: number
  status: StatusQuarto
}

export interface ReservaResponse {
  id: number
  dataCheckIn: string
  dataCheckOut: string
  status: StatusReserva
  usuarioId: number
  quartoId: number
}

export interface CriarReservaRequest {
  quartoId: number
  dataCheckIn: string
  dataCheckOut: string
}

export interface AtualizarReservaRequest {
  dataCheckIn: string
  dataCheckOut: string
}

export interface NotificacaoResponse {
  id: number
  reservaId: number
  tipoEvento: string
  hospede: string
  hospedeEmail: string
  hotel: string
  quartoNumero: number
  dataCheckIn: string
  dataCheckOut: string
  processadoEm: string
}

export interface ApiErrorBody {
  mensagem?: string
  title?: string
  errors?: Record<string, string[]>
}
