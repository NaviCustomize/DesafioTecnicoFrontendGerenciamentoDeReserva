import axios from 'axios'
import { mockAdapter } from './mockAdapter'

export const CHAVE_SESSAO_EXPIRADA = 'sgr:sessao-expirada'

const modoDemonstracao = import.meta.env.VITE_MOCK === 'true'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  ...(modoDemonstracao ? { adapter: mockAdapter } : {}),
})

if (modoDemonstracao) {
  console.info('[SGR] Modo demonstração ativo — os dados são de exemplo, sem backend.')
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const ehLogin = error.config?.url === '/auth/login'
    const jaEstaNoLogin = window.location.pathname === '/login'

    if (error.response?.status === 401 && !ehLogin && !jaEstaNoLogin) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuarioId')
      localStorage.removeItem('usuarioNome')

      sessionStorage.setItem(CHAVE_SESSAO_EXPIRADA, 'true')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export function extrairMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    if (typeof data === 'string') return data
    if (data?.mensagem) return data.mensagem
    if (data?.title) return data.title

    if (error.code === 'ERR_NETWORK') {
      return 'Não foi possível conectar à API. Verifique se o backend está rodando.'
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente.'
}
