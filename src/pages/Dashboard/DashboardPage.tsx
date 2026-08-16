import { useCallback, useEffect, useMemo, useState } from 'react'
import { Table, Button, Spinner, Alert } from 'react-bootstrap'
import { ToastService } from '../../components/Toast'
import { AppLayout } from '../../layout/AppLayout'
import { StatusBadge } from '../../components/StatusBadge'
import { StatusQuartoBadge } from '../Admin/StatusQuartoBadge'
import { ICONS, ICON_SIZES } from '../../components/Icons'
import type { HotelResponse, QuartoResponse, ReservaResponse, StatusQuarto } from '../../types/api'
import { listarTodasReservas } from '../../services/reservaService'
import { listarHoteis } from '../../services/hotelService'
import { listarQuartos } from '../../services/quartoService'
import { extrairMensagemErro } from '../../services/api'
import { calcularTotal, formatarMoeda, formatarDataComHora, hojeISO } from '../../utils/reserva'
import {
  GradeIndicadores,
  Cartao,
  RotuloIndicador,
  ValorIndicador,
  DetalheIndicador,
  Barra,
  BarraPreenchida,
  ListaStatus,
  ItemStatus,
} from './DashboardPage.styles'

const { AiOutlineTable } = ICONS

const ID_TOAST_DASHBOARD = 'erro-carregar-dashboard'

const ORDEM_STATUS: StatusQuarto[] = ['Disponivel', 'Reservado']

function ehFutura(data: string): boolean {
  return data.slice(0, 10) >= hojeISO()
}

export function DashboardPage() {
  const [reservas, setReservas] = useState<ReservaResponse[]>([])
  const [hoteis, setHoteis] = useState<HotelResponse[]>([])
  const [quartos, setQuartos] = useState<QuartoResponse[]>([])
  const [carregando, setCarregando] = useState(true)
  const [falhou, setFalhou] = useState(false)

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    setFalhou(false)
    ToastService.dispensar(ID_TOAST_DASHBOARD)

    try {
      const [reservasData, hoteisData, quartosData] = await Promise.all([
        listarTodasReservas(),
        listarHoteis(),
        listarQuartos(),
      ])

      setReservas(reservasData)
      setHoteis(hoteisData)
      setQuartos(quartosData)
    } catch (error) {
      setFalhou(true)
      ToastService.errorPersistente(extrairMensagemErro(error), ID_TOAST_DASHBOARD)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const indicadores = useMemo(() => {
    const porStatus = ORDEM_STATUS.map((status) => ({
      status,
      quantidade: quartos.filter((q) => q.status === status).length,
    }))

    const ocupados = quartos.filter((q) => q.status === 'Reservado').length
    const ocupacao = quartos.length > 0 ? Math.round((ocupados / quartos.length) * 100) : 0

    const ativas = reservas.filter(
      (r) => r.status === 'Pendente' || r.status === 'Confirmada',
    )

    const receitaPrevista = ativas.reduce((soma, reserva) => {
      const total = calcularTotal(
        quartos.find((q) => q.id === reserva.quartoId),
        reserva.dataCheckIn,
        reserva.dataCheckOut,
      )

      return soma + (total ?? 0)
    }, 0)

    const proximosCheckIns = ativas
      .filter((r) => ehFutura(r.dataCheckIn))
      .sort((a, b) => a.dataCheckIn.localeCompare(b.dataCheckIn))
      .slice(0, 5)

    return { porStatus, ocupacao, ocupados, ativas, receitaPrevista, proximosCheckIns }
  }, [quartos, reservas])

  function descreverQuarto(quartoId: number): string {
    const quarto = quartos.find((q) => q.id === quartoId)

    if (!quarto) return `Quarto #${quartoId}`

    const hotel = hoteis.find((h) => h.id === quarto.hotelId)

    return `${hotel?.nome ?? `Hotel #${quarto.hotelId}`} — Quarto ${quarto.numero}`
  }

  return (
    <AppLayout
      titulo="Painel"
      icone={<AiOutlineTable size={ICON_SIZES.header} aria-hidden="true" />}
    >
      {carregando && (
        <div className="text-center py-5" role="status" aria-live="polite">
          <Spinner animation="border" style={{ color: 'var(--verde-escuro)' }} aria-hidden="true" />
          <span className="visually-hidden">Carregando indicadores...</span>
        </div>
      )}

      {!carregando && falhou && (
        <div className="text-center py-5">
          <p className="mb-3">Não foi possível carregar o painel.</p>
          <Button variant="outline-success" onClick={carregarDados}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!carregando && !falhou && (
        <>
          <h2 className="mb-3" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Visão geral
          </h2>

          <GradeIndicadores>
            <Cartao>
              <RotuloIndicador>Hotéis</RotuloIndicador>
              <ValorIndicador>{hoteis.length}</ValorIndicador>
              <DetalheIndicador>
                {quartos.length} {quartos.length === 1 ? 'quarto' : 'quartos'} no total
              </DetalheIndicador>
            </Cartao>

            <Cartao>
              <RotuloIndicador>Taxa de ocupação</RotuloIndicador>
              <ValorIndicador>{indicadores.ocupacao}%</ValorIndicador>
              <DetalheIndicador>
                {indicadores.ocupados} de {quartos.length} quartos reservados
              </DetalheIndicador>
              <Barra
                role="img"
                aria-label={`Ocupação de ${indicadores.ocupacao} por cento`}
              >
                <BarraPreenchida $percentual={indicadores.ocupacao} />
              </Barra>
            </Cartao>

            <Cartao>
              <RotuloIndicador>Reservas ativas</RotuloIndicador>
              <ValorIndicador>{indicadores.ativas.length}</ValorIndicador>
              <DetalheIndicador>de {reservas.length} no total</DetalheIndicador>
            </Cartao>

            <Cartao>
              <RotuloIndicador>Receita prevista</RotuloIndicador>
              <ValorIndicador style={{ fontSize: '1.5rem' }}>
                {formatarMoeda(indicadores.receitaPrevista)}
              </ValorIndicador>
              <DetalheIndicador>somando as reservas ativas</DetalheIndicador>
            </Cartao>
          </GradeIndicadores>

          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <Cartao>
                <h3 className="mb-3" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Quartos por situação
                </h3>

                {quartos.length === 0 ? (
                  <p className="mb-0 text-muted">Nenhum quarto cadastrado.</p>
                ) : (
                  <ListaStatus>
                    {indicadores.porStatus.map(({ status, quantidade }) => (
                      <ItemStatus key={status}>
                        <StatusQuartoBadge status={status} />
                        <span>
                          <strong>{quantidade}</strong>{' '}
                          {quantidade === 1 ? 'quarto' : 'quartos'}
                        </span>
                      </ItemStatus>
                    ))}
                  </ListaStatus>
                )}
              </Cartao>
            </div>

            <div className="col-12 col-lg-7">
              <Cartao>
                <h3 className="mb-3" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Próximos check-ins
                </h3>

                {indicadores.proximosCheckIns.length === 0 ? (
                  <p className="mb-0 text-muted">Nenhum check-in futuro agendado.</p>
                ) : (
                  <section
                    tabIndex={0}
                    aria-label="Próximos check-ins"
                    className="table-responsive"
                  >
                    <Table className="mb-0">
                      <caption className="visually-hidden">
                        Próximos cinco check-ins das reservas ativas.
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Hotel / Quarto</th>
                          <th scope="col">Check-in</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {indicadores.proximosCheckIns.map((reserva) => (
                          <tr key={reserva.id}>
                            <td>{descreverQuarto(reserva.quartoId)}</td>
                            <td>{formatarDataComHora(reserva.dataCheckIn)}</td>
                            <td>
                              <StatusBadge status={reserva.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </section>
                )}
              </Cartao>
            </div>
          </div>

          {reservas.length === 0 && (
            <Alert variant="info" className="mt-4">
              Ainda não há reservas no sistema.
            </Alert>
          )}
        </>
      )}
    </AppLayout>
  )
}
