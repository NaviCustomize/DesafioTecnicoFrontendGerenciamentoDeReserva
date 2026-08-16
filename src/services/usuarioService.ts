import { api } from './api'
import type {
  AlterarSenhaRequest,
  AtualizarUsuarioRequest,
  ConfirmarSenhaRequest,
  CriarUsuarioRequest,
  UsuarioAdminResponse,
  UsuarioResponse,
} from '../types/api'

export async function criarUsuario(dados: CriarUsuarioRequest): Promise<UsuarioResponse> {
  const { data } = await api.post<UsuarioResponse>('/usuarios', dados)
  return data
}

export async function listarUsuarios(): Promise<UsuarioResponse[]> {
  const { data } = await api.get<UsuarioResponse[]>('/usuarios')
  return data
}

export async function buscarUsuarioPorId(id: number): Promise<UsuarioResponse> {
  const { data } = await api.get<UsuarioResponse>(`/usuarios/${id}`)
  return data
}

export async function atualizarUsuario(
  id: number,
  dados: AtualizarUsuarioRequest,
): Promise<void> {
  await api.put(`/usuarios/${id}`, dados)
}

export async function listarUsuariosParaGestao(): Promise<UsuarioAdminResponse[]> {
  const { data } = await api.get<UsuarioAdminResponse[]>('/usuarios/gestao')
  return data
}

export async function inativarUsuario(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`)
}

export async function reativarUsuario(id: number): Promise<void> {
  await api.patch(`/usuarios/${id}/reativar`)
}

export async function alterarSenha(id: number, dados: AlterarSenhaRequest): Promise<void> {
  await api.put(`/usuarios/${id}/senha`, dados)
}

export async function encerrarPropriaConta(
  id: number,
  dados: ConfirmarSenhaRequest,
): Promise<void> {
  await api.post(`/usuarios/${id}/encerrar-conta`, dados)
}
