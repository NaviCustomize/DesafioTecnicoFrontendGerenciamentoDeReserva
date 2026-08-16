import { useEffect, useState, type FormEvent } from 'react'
import { Modal, Form, Button, Spinner } from 'react-bootstrap'
import { ToastService } from '../../components/Toast'
import type { HotelResponse, QuartoResponse, TipoQuarto } from '../../types/api'
import { atualizarQuarto, criarQuarto } from '../../services/quartoService'
import { extrairMensagemErro } from '../../services/api'

const TIPOS: { valor: TipoQuarto; rotulo: string }[] = [
  { valor: 'Standard', rotulo: 'Standard' },
  { valor: 'Luxo', rotulo: 'Luxo' },
  { valor: 'SuiteMaster', rotulo: 'Suíte Master' },
]

interface QuartoModalProps {
  show: boolean
  hoteis: HotelResponse[]
  quartoEmEdicao?: QuartoResponse | null
  onClose: () => void
  onSalvo: () => void
}

export function QuartoModal({ show, hoteis, quartoEmEdicao, onClose, onSalvo }: QuartoModalProps) {
  const editando = Boolean(quartoEmEdicao)

  const [hotelId, setHotelId] = useState('')
  const [numero, setNumero] = useState('')
  const [tipo, setTipo] = useState<TipoQuarto>('Standard')
  const [preco, setPreco] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!show) return

    setHotelId(quartoEmEdicao ? String(quartoEmEdicao.hotelId) : '')
    setNumero(quartoEmEdicao ? String(quartoEmEdicao.numero) : '')
    setTipo(quartoEmEdicao?.tipo ?? 'Standard')
    setPreco(quartoEmEdicao ? String(quartoEmEdicao.precoPorNoite) : '')
  }, [show, quartoEmEdicao])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!hotelId) {
      ToastService.error('Selecione o hotel do quarto.')
      return
    }

    const numeroConvertido = Number(numero)
    const precoConvertido = Number(preco)

    if (!Number.isInteger(numeroConvertido) || numeroConvertido <= 0) {
      ToastService.error('O número do quarto deve ser um inteiro positivo.')
      return
    }

    if (!Number.isFinite(precoConvertido) || precoConvertido <= 0) {
      ToastService.error('Informe um preço por noite maior que zero.')
      return
    }

    setCarregando(true)

    try {
      if (quartoEmEdicao) {
        await atualizarQuarto(quartoEmEdicao.id, {
          numero: numeroConvertido,
          tipo,
          precoPorNoite: precoConvertido,
        })
        ToastService.success('Quarto atualizado.')
      } else {
        await criarQuarto({
          hotelId: Number(hotelId),
          numero: numeroConvertido,
          tipo,
          precoPorNoite: precoConvertido,
        })
        ToastService.success('Quarto cadastrado.')
      }

      onSalvo()
      onClose()
    } catch (error) {
      ToastService.error(extrairMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered aria-labelledby="titulo-quarto">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton closeLabel="Fechar">
          <Modal.Title as="h2" id="titulo-quarto" style={{ fontSize: '1.25rem' }}>
            {editando ? 'Editar Quarto' : 'Novo Quarto'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {editando && (
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              O hotel e a situação do quarto não são alterados por aqui.
            </p>
          )}

          <Form.Group className="mb-3" controlId="quarto-hotel">
            <Form.Label>Hotel</Form.Label>
            <Form.Select
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
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

          <Form.Group className="mb-3" controlId="quarto-numero">
            <Form.Label>Número</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="quarto-tipo">
            <Form.Label>Tipo</Form.Label>
            <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoQuarto)}>
              {TIPOS.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.rotulo}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="quarto-preco">
            <Form.Label>Preço por noite (R$)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" disabled={carregando} aria-busy={carregando}>
            {carregando && <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />}
            {editando ? 'Salvar Alterações' : 'Cadastrar Quarto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
