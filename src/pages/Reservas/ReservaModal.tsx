import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Modal, Form, Button, Spinner } from 'react-bootstrap'
import { ToastService } from '../../components/Toast'
import type { HotelResponse, QuartoResponse, ReservaResponse } from '../../types/api'
import { atualizarReserva, criarReserva } from '../../services/reservaService'
import { extrairMensagemErro } from '../../services/api'
import { calcularNoites, calcularTotal, formatarMoeda, hojeISO } from '../../utils/reserva'

interface ReservaModalProps {
  show: boolean
  hoteis: HotelResponse[]
  quartos: QuartoResponse[]

  reservaEmEdicao?: ReservaResponse | null
  onClose: () => void
  onSalvo: () => void
}

function paraValorDeInput(data: string): string {
  return data.slice(0, 10)
}

export function ReservaModal({
  show,
  hoteis,
  quartos,
  reservaEmEdicao,
  onClose,
  onSalvo,
}: ReservaModalProps) {
  const editando = Boolean(reservaEmEdicao)

  const [hotelId, setHotelId] = useState('')
  const [quartoId, setQuartoId] = useState('')
  const [dataCheckIn, setDataCheckIn] = useState('')
  const [dataCheckOut, setDataCheckOut] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!show) return

    if (!reservaEmEdicao) {
      setHotelId('')
      setQuartoId('')
      setDataCheckIn('')
      setDataCheckOut('')
      return
    }

    const quarto = quartos.find((q) => q.id === reservaEmEdicao.quartoId)

    setHotelId(quarto ? String(quarto.hotelId) : '')
    setQuartoId(String(reservaEmEdicao.quartoId))
    setDataCheckIn(paraValorDeInput(reservaEmEdicao.dataCheckIn))
    setDataCheckOut(paraValorDeInput(reservaEmEdicao.dataCheckOut))
  }, [show, reservaEmEdicao, quartos])

  const quartosDisponiveis = useMemo(
    () => quartos.filter((quarto) => String(quarto.hotelId) === hotelId),
    [quartos, hotelId],
  )

  const semQuartos = Boolean(hotelId) && quartosDisponiveis.length === 0

  const quartoSelecionado = quartos.find((q) => String(q.id) === quartoId)
  const noites = calcularNoites(dataCheckIn, dataCheckOut)
  const total = calcularTotal(quartoSelecionado, dataCheckIn, dataCheckOut)

  function limparEFechar() {
    setHotelId('')
    setQuartoId('')
    setDataCheckIn('')
    setDataCheckOut('')
    onClose()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!hotelId || !quartoId) {
      ToastService.error('Selecione o hotel e o quarto para continuar.')
      return
    }

    if (!dataCheckIn || !dataCheckOut) {
      ToastService.error('Informe as datas de check-in e check-out.')
      return
    }

    if (dataCheckIn >= dataCheckOut) {
      ToastService.error('A data de check-in deve ser anterior à data de check-out.')
      return
    }

    setCarregando(true)

    try {
      if (reservaEmEdicao) {
        await atualizarReserva(reservaEmEdicao.id, { dataCheckIn, dataCheckOut })
        ToastService.success('Reserva atualizada com sucesso!')
      } else {
        await criarReserva({ quartoId: Number(quartoId), dataCheckIn, dataCheckOut })
        ToastService.success('Reserva criada com sucesso!')
      }

      onSalvo()
      limparEFechar()
    } catch (error) {
      ToastService.error(extrairMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Modal show={show} onHide={limparEFechar} centered aria-labelledby="titulo-reserva">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton closeLabel="Fechar">
          <Modal.Title as="h2" id="titulo-reserva" style={{ fontSize: '1.25rem' }}>
            {editando ? 'Editar Reserva' : 'Nova Reserva'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {editando && (
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              Só o período pode ser alterado. Para trocar de quarto, cancele esta reserva e crie
              uma nova.
            </p>
          )}

          <Form.Group className="mb-3" controlId="reserva-hotel">
            <Form.Label>Hotel</Form.Label>
            <Form.Select
              value={hotelId}
              onChange={(e) => {
                setHotelId(e.target.value)
                setQuartoId('')
              }}
              disabled={editando}
              required
            >
              <option value="">Selecione um hotel</option>
              {hoteis.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.nome} — {hotel.localizacao}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="reserva-quarto">
            <Form.Label>Quarto</Form.Label>
            <Form.Select
              value={quartoId}
              onChange={(e) => setQuartoId(e.target.value)}
              disabled={editando || !hotelId}
              required
              aria-describedby={semQuartos ? 'aviso-sem-quartos' : undefined}
            >
              <option value="">
                {hotelId ? 'Selecione um quarto disponível' : 'Selecione um hotel primeiro'}
              </option>
              {quartosDisponiveis.map((quarto) => (
                <option key={quarto.id} value={quarto.id}>
                  Quarto {quarto.numero} — {quarto.tipo} — R$ {quarto.precoPorNoite.toFixed(2)}/noite
                </option>
              ))}
            </Form.Select>
            <div aria-live="polite">
              {semQuartos && (
                <Form.Text id="aviso-sem-quartos" className="text-danger">
                  Nenhum quarto deste hotel está em operação no momento.
                </Form.Text>
              )}
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="reserva-checkin">
            <Form.Label>Check-in</Form.Label>
            <Form.Control
              type="date"

              min={hojeISO()}
              value={dataCheckIn}
              onChange={(e) => setDataCheckIn(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="reserva-checkout">
            <Form.Label>Check-out</Form.Label>
            <Form.Control
              type="date"
              min={dataCheckIn || hojeISO()}
              value={dataCheckOut}
              onChange={(e) => setDataCheckOut(e.target.value)}
              required
            />
          </Form.Group>

          <div aria-live="polite">
            {total !== null && quartoSelecionado && (
              <div
                className="d-flex justify-content-between align-items-baseline p-3 rounded"
                style={{ backgroundColor: 'var(--branco-primario)' }}
              >
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {noites} {noites === 1 ? 'diária' : 'diárias'} ×{' '}
                  {formatarMoeda(quartoSelecionado.precoPorNoite)}
                </span>
                <strong style={{ fontSize: '1.15rem', fontVariantNumeric: 'tabular-nums' }}>
                  {formatarMoeda(total)}
                </strong>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={limparEFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" disabled={carregando} aria-busy={carregando}>
            {carregando && <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />}
            {editando ? 'Salvar Alterações' : 'Confirmar Reserva'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
