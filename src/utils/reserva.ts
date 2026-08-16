import type { QuartoResponse } from '../types/api'

const MS_POR_DIA = 1000 * 60 * 60 * 24

function somenteData(valor: string): string {
  return valor.slice(0, 10)
}

export function calcularNoites(dataCheckIn: string, dataCheckOut: string): number {
  if (!dataCheckIn || !dataCheckOut) return 0

  const entrada = Date.parse(`${somenteData(dataCheckIn)}T00:00:00Z`)
  const saida = Date.parse(`${somenteData(dataCheckOut)}T00:00:00Z`)

  if (Number.isNaN(entrada) || Number.isNaN(saida)) return 0

  const noites = Math.round((saida - entrada) / MS_POR_DIA)

  return noites > 0 ? noites : 0
}

export function calcularTotal(
  quarto: QuartoResponse | undefined,
  dataCheckIn: string,
  dataCheckOut: string,
): number | null {
  if (!quarto) return null

  const noites = calcularNoites(dataCheckIn, dataCheckOut)

  return noites > 0 ? noites * quarto.precoPorNoite : null
}

export function formatarData(data: string): string {
  return new Date(`${data.slice(0, 10)}T00:00:00Z`).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  })
}

export function formatarHora(data: string): string {
  const hora = data.slice(11, 16)

  if (!hora || hora === '00:00') return ''

  const [h, m] = hora.split(':')

  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`
}

export function formatarDataComHora(data: string): string {
  const hora = formatarHora(data)

  return hora ? `${formatarData(data)} às ${hora}` : formatarData(data)
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function hojeISO(): string {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')

  return `${agora.getFullYear()}-${mes}-${dia}`
}
