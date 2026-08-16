import { useCallback, useEffect, useState } from 'react'
import { Table, Button, Spinner, Alert, Modal } from 'react-bootstrap'
import { ToastService } from '../../components/Toast'
import { AppLayout } from '../../layout/AppLayout'
import { StatusBadge } from '../../components/StatusBadge'
import { ICONS, ICON_SIZES } from '../../components/Icons'
import { ReservaModal } from './ReservaModal'
import type { HotelResponse, QuartoResponse, ReservaResponse } from '../../types/api'
import { listarMinhasReservas, cancelarReserva } from '../../services/reservaService'
import { listarHoteis } from '../../services/hotelService'
import { listarQuartos } from '../../services/quartoService'
import { extrairMensagemErro } from '../../services/api'
import { calcularTotal, formatarMoeda, formatarData, formatarHora } from '../../utils/reserva'

const { IoMdAddCircleOutline, IoMdCloseCircleOutline, MdOutlineEdit, CgHome } = ICONS

const ID_TOAST_CARREGAMENTO = 'erro-carregar-reservas'

export function ReservasPage() {
  const [reservas, setReservas] = useState<ReservaResponse[]>([])
  const [hoteis, setHoteis] = useState<HotelResponse[]>([])
  const [quartos, setQuartos] = useState<QuartoResponse[]>([])
  const [carregando, setCarregando] = useState(true)
  const [falhouCarregamento, setFalhouCarregamento] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [reservaEmEdicao, setReservaEmEdicao] = useState<ReservaResponse | null>(null)
  const [reservaParaCancelar, setReservaParaCancelar] = useState<ReservaResponse | null>(null)
  const [cancelando, setCancelando] = useState(false)

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    setFalhouCarregamento(false)
    ToastService.dispensar(ID_TOAST_CARREGAMENTO)

    try {
      const [reservasData, hoteisData, quartosData] = await Promise.all([
        listarMinhasReservas(),
        listarHoteis(),
        listarQuartos(),
      ])

      setReservas(reservasData)
      setHoteis(hoteisData)
      setQuartos(quartosData)
    } catch (error) {
      setFalhouCarregamento(true)

      ToastService.errorPersistente(extrairMensagemErro(error), ID_TOAST_CARREGAMENTO)
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

  async function confirmarCancelamento() {
    if (!reservaParaCancelar) return

    setCancelando(true)

    try {
      await cancelarReserva(reservaParaCancelar.id)
      ToastService.success('Reserva cancelada.')
      setReservaParaCancelar(null)
      await carregarDados()

      document.getElementById('conteudo-principal')?.focus()
    } catch (error) {
      ToastService.error(extrairMensagemErro(error))
    } finally {
      setCancelando(false)
    }
  }

  return (
    <AppLayout
      titulo="Início"
      tituloDocumento="Minhas Reservas"
      icone={<CgHome size={ICON_SIZES.header} aria-hidden="true" />}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Minhas Reservas
        </h2>
        <Button
          variant="success"
          onClick={() => {
            setReservaEmEdicao(null)
            setModalAberto(true)
          }}
        >
          <IoMdAddCircleOutline className="me-1" aria-hidden="true" />
          Nova Reserva
        </Button>
      </div>

      {carregando && (
        <div className="text-center py-5" role="status" aria-live="polite">
          <Spinner animation="border" style={{ color: 'var(--verde-escuro)' }} aria-hidden="true" />
          <span className="visually-hidden">Carregando reservas...</span>
        </div>
      )}

      {!carregando && falhouCarregamento && (
        <div className="text-center py-5">
          <p className="mb-3">Não foi possível carregar suas reservas.</p>
          <Button variant="outline-success" onClick={carregarDados}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!carregando && !falhouCarregamento && reservas.length === 0 && (
        <Alert variant="info">Você ainda não possui reservas. Crie a primeira!</Alert>
      )}

      {!carregando && !falhouCarregamento && reservas.length > 0 && (
        <section tabIndex={0} aria-label="Lista das minhas reservas" className="table-responsive">
          <Table hover className="bg-white rounded shadow-sm overflow-hidden mb-0">
            <caption className="visually-hidden">
              Reservas do usuário, com hotel, quarto, período, situação e ação de cancelamento.
            </caption>
            <thead>
              <tr>
                <th scope="col">Hotel / Quarto</th>
                <th scope="col">Check-in</th>
                <th scope="col">Check-out</th>
                <th scope="col" className="text-end">Valor</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => {
                const ativa = reserva.status === 'Pendente' || reserva.status === 'Confirmada'
                const podeCancelar = ativa
                const podeEditar = ativa
                const descricao = obterDescricaoQuarto(reserva.quartoId)
                const valorTotal = calcularTotal(
                  quartos.find((q) => q.id === reserva.quartoId),
                  reserva.dataCheckIn,
                  reserva.dataCheckOut,
                )

                return (
                  <tr key={reserva.id}>
                    <td>{descricao}</td>
                    <td>
                      {formatarData(reserva.dataCheckIn)}
                      {formatarHora(reserva.dataCheckIn) && (
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          a partir das {formatarHora(reserva.dataCheckIn)}
                        </div>
                      )}
                    </td>
                    <td>
                      {formatarData(reserva.dataCheckOut)}
                      {formatarHora(reserva.dataCheckOut) && (
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          até as {formatarHora(reserva.dataCheckOut)}
                        </div>
                      )}
                    </td>
                    <td className="text-end" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {valorTotal !== null ? formatarMoeda(valorTotal) : '—'}
                    </td>
                    <td>
                      <StatusBadge status={reserva.status} />
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end flex-wrap">
                        <Button
                          variant="outline-success"
                          size="sm"
                          disabled={!podeEditar}
                          onClick={() => {
                            setReservaEmEdicao(reserva)
                            setModalAberto(true)
                          }}
                          aria-label={`Editar reserva ${descricao}, check-in em ${formatarData(reserva.dataCheckIn)}`}
                        >
                          <MdOutlineEdit className="me-1" aria-hidden="true" />
                          Editar
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          disabled={!podeCancelar}
                          onClick={() => setReservaParaCancelar(reserva)}
                          aria-label={`Cancelar reserva ${descricao}, check-in em ${formatarData(reserva.dataCheckIn)}`}
                        >
                          <IoMdCloseCircleOutline className="me-1" aria-hidden="true" />
                          Cancelar
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </section>
      )}

      <ReservaModal
        show={modalAberto}
        hoteis={hoteis}
        quartos={quartos}
        reservaEmEdicao={reservaEmEdicao}
        onClose={() => {
          setModalAberto(false)
          setReservaEmEdicao(null)
        }}
        onSalvo={carregarDados}
      />

      <Modal
        show={reservaParaCancelar !== null}
        onHide={() => setReservaParaCancelar(null)}
        centered
        aria-labelledby="titulo-confirmar-cancelamento"
      >
        <Modal.Header closeButton closeLabel="Fechar">
          <Modal.Title as="h2" id="titulo-confirmar-cancelamento" style={{ fontSize: '1.25rem' }}>
            Cancelar reserva
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {reservaParaCancelar && (
            <p className="mb-0">
              Tem certeza que deseja cancelar a reserva de{' '}
              <strong>{obterDescricaoQuarto(reservaParaCancelar.quartoId)}</strong>, com check-in em{' '}
              <strong>{formatarData(reservaParaCancelar.dataCheckIn)}</strong>? Esta ação não pode ser desfeita.
            </p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setReservaParaCancelar(null)} autoFocus>
            Manter reserva
          </Button>
          <Button variant="danger" onClick={confirmarCancelamento} disabled={cancelando} aria-busy={cancelando}>
            {cancelando && <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />}
            Cancelar reserva
          </Button>
        </Modal.Footer>
      </Modal>
    </AppLayout>
  )
}
