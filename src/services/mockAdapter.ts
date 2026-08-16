import { AxiosError, type AxiosAdapter, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type {
  HotelResponse,
  LoginResponse,
  QuartoResponse,
  ReservaResponse,
  UsuarioResponse,
} from '../types/api'

const hoteis: HotelResponse[] = [
  { id: 1, nome: 'Hotel Serra Azul', localizacao: 'Petrópolis, RJ', descricao: 'Vista para a serra' },
  { id: 2, nome: 'Pousada Vale das Flores', localizacao: 'Teresópolis, RJ', descricao: null },
  { id: 3, nome: 'Hotel Costa do Sol', localizacao: 'Cabo Frio, RJ', descricao: 'Pé na areia' },
]

const quartos: QuartoResponse[] = [
  { id: 1, hotelId: 1, numero: 101, tipo: 'Standard', precoPorNoite: 250, status: 'Disponivel' },
  { id: 2, hotelId: 1, numero: 102, tipo: 'Luxo', precoPorNoite: 480, status: 'Disponivel' },
  { id: 3, hotelId: 1, numero: 201, tipo: 'SuiteMaster', precoPorNoite: 890, status: 'Reservado' },
  { id: 4, hotelId: 2, numero: 12, tipo: 'Standard', precoPorNoite: 190, status: 'Disponivel' },
  { id: 5, hotelId: 2, numero: 14, tipo: 'Luxo', precoPorNoite: 350, status: 'Disponivel' },
  { id: 6, hotelId: 3, numero: 305, tipo: 'SuiteMaster', precoPorNoite: 1200, status: 'Disponivel' },
]

const EMAIL_DEMO = 'demo@sgr.com'
const EMAIL_ADMIN_DEMO = 'admin@sgr.com'

let usuarios: UsuarioResponse[] = [
  { id: 1, nome: 'Demo', sobrenome: 'Da Silva', email: EMAIL_DEMO, role: 'User' },
  { id: 2, nome: 'Admin', sobrenome: 'Do Sistema', email: EMAIL_ADMIN_DEMO, role: 'Admin' },
]

let reservas: ReservaResponse[] = [
  { id: 1, dataCheckIn: '2026-08-20', dataCheckOut: '2026-08-24', status: 'Confirmada', usuarioId: 1, quartoId: 2 },
  { id: 2, dataCheckIn: '2026-09-02', dataCheckOut: '2026-09-05', status: 'Pendente', usuarioId: 1, quartoId: 4 },
  { id: 3, dataCheckIn: '2026-07-10', dataCheckOut: '2026-07-15', status: 'Finalizada', usuarioId: 1, quartoId: 1 },
  { id: 4, dataCheckIn: '2026-06-01', dataCheckOut: '2026-06-03', status: 'Cancelada', usuarioId: 1, quartoId: 6 },
]

let proximoIdUsuario = 3
let proximoIdReserva = 5

function gerarToken(usuarioId: number): string {
  return `demo-token-${usuarioId}`
}

function idDoRequisitante(config: AxiosRequestConfig): number | null {
  const autorizacao = String(config.headers?.Authorization ?? '')
  const encontrado = autorizacao.match(/demo-token-(\d+)/)

  return encontrado ? Number(encontrado[1]) : null
}

function responder<T>(config: AxiosRequestConfig, data: T, status = 200): Promise<AxiosResponse<T>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const resposta: AxiosResponse<T> = {
        data,
        status,
        statusText: status >= 400 ? 'Error' : 'OK',
        headers: {},
        config: config as AxiosResponse<T>['config'],
      }

      if (status >= 400) {
        reject(
          new AxiosError(
            `Request failed with status code ${status}`,
            String(status),
            config as AxiosError['config'],
            null,
            resposta as AxiosResponse,
          ),
        )
        return
      }

      resolve(resposta)
    }, 320)
  })
}

export const mockAdapter: AxiosAdapter = (config) => {
  const url = config.url ?? ''
  const metodo = (config.method ?? 'get').toLowerCase()
  const corpo = config.data ? JSON.parse(config.data as string) : {}

  if (localStorage.getItem('sgr:simular-401') === 'true' && url !== '/auth/login') {
    return responder(config, { mensagem: 'Token expirado.' } as never, 401)
  }

  if (metodo === 'post' && url === '/auth/login') {
    const email = String(corpo.email ?? '').trim().toLowerCase()
    const existente = usuarios.find((u) => u.email.toLowerCase() === email)

    const usuario: UsuarioResponse = existente ?? {
      id: proximoIdUsuario++,
      nome: email.split('@')[0] || 'usuario',
      sobrenome: 'Demonstração',
      email,
      role: 'User',
    }

    if (!existente) {
      usuarios = [...usuarios, usuario]
    }

    const resposta: LoginResponse = {
      token: gerarToken(usuario.id),
      usuarioId: usuario.id,
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      role: usuario.role,
    }

    return responder(config, resposta)
  }

  if (metodo === 'post' && url === '/usuarios') {
    const email = String(corpo.email ?? '').trim().toLowerCase()

    if (usuarios.some((u) => u.email.toLowerCase() === email)) {
      return responder(config, { mensagem: 'Este e-mail já está cadastrado.' } as never, 409)
    }

    if (!String(corpo.sobrenome ?? '').trim()) {
      return responder(config, { mensagem: 'O sobrenome é obrigatório.' } as never, 400)
    }

    const novo: UsuarioResponse = {
      id: proximoIdUsuario++,
      nome: corpo.nome,
      sobrenome: corpo.sobrenome,
      email,
      role: 'User',
    }

    usuarios = [...usuarios, novo]

    return responder(config, novo, 201)
  }

  if (metodo === 'get' && url === '/hoteis') {
    return responder(config, hoteis)
  }

  if (metodo === 'get' && url === '/quartos') {
    return responder(config, quartos)
  }

  if (metodo === 'get' && url === '/reservas/minhas/historico') {
    const usuarioId = idDoRequisitante(config)

    if (usuarioId === null) {
      return responder(config, { mensagem: 'Não autenticado.' } as never, 401)
    }

    const agora = new Date()

    return responder(
      config,
      reservas.filter(
        (reserva) =>
          reserva.usuarioId === usuarioId &&
          (reserva.status === 'Cancelada' || new Date(reserva.dataCheckOut) < agora),
      ),
    )
  }

  if (metodo === 'get' && url === '/reservas/minhas') {
    const usuarioId = idDoRequisitante(config)

    if (usuarioId === null) {
      return responder(config, { mensagem: 'Não autenticado.' } as never, 401)
    }

    return responder(
      config,
      reservas.filter((reserva) => reserva.usuarioId === usuarioId),
    )
  }

  if (metodo === 'post' && url === '/reservas') {
    const usuarioId = idDoRequisitante(config)

    if (usuarioId === null) {
      return responder(config, { mensagem: 'Não autenticado.' } as never, 401)
    }

    const nova: ReservaResponse = {
      id: proximoIdReserva++,
      dataCheckIn: corpo.dataCheckIn,
      dataCheckOut: corpo.dataCheckOut,
      status: 'Pendente',
      usuarioId,
      quartoId: Number(corpo.quartoId),
    }

    reservas = [...reservas, nova]

    return responder(config, nova, 201)
  }

  const edicao = url.match(/^\/reservas\/(\d+)$/)

  if (metodo === 'put' && edicao) {
    const usuarioId = idDoRequisitante(config)
    const id = Number(edicao[1])
    const alvo = reservas.find((reserva) => reserva.id === id)

    if (usuarioId === null) {
      return responder(config, { mensagem: 'Não autenticado.' } as never, 401)
    }

    if (!alvo || alvo.usuarioId !== usuarioId) {
      return responder(config, { mensagem: 'Reserva não encontrada.' } as never, 404)
    }

    if (alvo.status === 'Cancelada' || alvo.status === 'Finalizada') {
      return responder(
        config,
        { mensagem: 'Esta reserva não pode mais ser alterada.' } as never,
        409,
      )
    }

    const atualizada: ReservaResponse = {
      ...alvo,
      dataCheckIn: corpo.dataCheckIn,
      dataCheckOut: corpo.dataCheckOut,
    }

    reservas = reservas.map((reserva) => (reserva.id === id ? atualizada : reserva))

    return responder(config, undefined as never, 204)
  }

  const cancelamento = url.match(/^\/reservas\/(\d+)\/cancelar$/)

  if (metodo === 'patch' && cancelamento) {
    const usuarioId = idDoRequisitante(config)
    const id = Number(cancelamento[1])
    const alvo = reservas.find((reserva) => reserva.id === id)

    if (usuarioId === null) {
      return responder(config, { mensagem: 'Não autenticado.' } as never, 401)
    }

    if (!alvo || alvo.usuarioId !== usuarioId) {
      return responder(config, { mensagem: 'Reserva não encontrada.' } as never, 404)
    }

    reservas = reservas.map((reserva) =>
      reserva.id === id ? { ...reserva, status: 'Cancelada' } : reserva,
    )

    return responder(config, undefined as never, 204)
  }

  return responder(config, { mensagem: `Rota não mapeada no modo demonstração: ${metodo} ${url}` } as never, 404)
}
