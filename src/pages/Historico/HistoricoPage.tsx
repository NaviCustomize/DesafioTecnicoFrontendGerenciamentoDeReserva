import { useCallback, useEffect, useState } from 'react'
import { Table, Button, Spinner, Alert } from 'react-bootstrap'
import { ToastService } from '../../components/Toast'
import { AppLayout } from '../../layout/AppLayout'
import { StatusBadge } from '../../components/StatusBadge'
import { ICONS, ICON_SIZES } from '../../components/Icons'
import type { HotelResponse, QuartoResponse, ReservaResponse } from '../../types/api'
import { listarHistorico } from '../../services/reservaService'
import { listarHoteis } from '../../services/hotelService'
import { listarQuartos } from '../../services/quartoService'
import { extrairMensagemErro } from '../../services/api'
import { formatarDataComHora } from '../../utils/reserva'

const { MdEventNote } = ICONS

const ID_TOAST_HISTORICO = 'erro-carregar-historico'

export function HistoricoPage() {
  const [reservas, setReservas] = useState<ReservaResponse[]>([])
  const [hoteis, setHoteis] = useState<HotelResponse[]>([])
  const [quartos, setQuartos] = useState<QuartoResponse[]>([])
  const [carregando, setCarregando] = useState(true)
  const [falhouCarregamento, setFalhouCarregamento] = useState(false)

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    setFalhouCarregamento(false)
    ToastService.dispensar(ID_TOAST_HISTORICO)

    try {
      const [historico, hoteisData, quartosData] = await Promise.all([
        listarHistorico(),
        listarHoteis(),
        listarQuartos(),
      ])

      setReservas(historico)
      setHoteis(hoteisData)
      setQuartos(quartosData)
    } catch (error) {
      setFalhouCarregamento(true)
      ToastService.errorPersistente(extrairMensagemErro(error), ID_TOAST_HISTORICO)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  function obterDescricaoQuarto(quartoId: number): string {
    const quarto = quartos.find((q) => q.id === quartoId)

    if (!quarto) return `Quarto #${quartoId}`

    const hotel = hoteis.find((h) => h.id === quarto.hotelId)
    const nomeHotel = hotel?.nome ?? `Hotel #${quarto.hotelId}`

    return `${nomeHotel} — Quarto ${quarto.numero} (${quarto.tipo})`
  }

  return (
    <AppLayout titulo="Histórico" icone={<MdEventNote size={ICON_SIZES.header} aria-hidden="true" />}>
      <h2 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
        Histórico de Reservas
      </h2>

      {carregando && (
        <div className="text-center py-5" role="status" aria-live="polite">
          <Spinner animation="border" style={{ color: 'var(--verde-escuro)' }} aria-hidden="true" />
          <span className="visually-hidden">Carregando histórico...</span>
        </div>
      )}

      {!carregando && falhouCarregamento && (
        <div className="text-center py-5">
          <p className="mb-3">Não foi possível carregar seu histórico.</p>
          <Button variant="outline-success" onClick={carregarDados}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!carregando && !falhouCarregamento && reservas.length === 0 && (
        <Alert variant="info">Você ainda não possui reservas no histórico.</Alert>
      )}

      {!carregando && !falhouCarregamento && reservas.length > 0 && (
        <section tabIndex={0} aria-label="Histórico das minhas reservas" className="table-responsive">
          <Table hover className="bg-white rounded shadow-sm overflow-hidden mb-0">
            <caption className="visually-hidden">
              Reservas anteriores do usuário, com hotel, quarto, período e situação final.
            </caption>
            <thead>
              <tr>
                <th scope="col">Hotel / Quarto</th>
                <th scope="col">Check-in</th>
                <th scope="col">Check-out</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{obterDescricaoQuarto(reserva.quartoId)}</td>
                  <td>{formatarDataComHora(reserva.dataCheckIn)}</td>
                  <td>{formatarDataComHora(reserva.dataCheckOut)}</td>
                  <td>
                    <StatusBadge status={reserva.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      )}
    </AppLayout>
  )
}
