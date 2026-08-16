import { useEffect, useState, type FormEvent } from 'react'
import { Modal, Form, Button, Spinner } from 'react-bootstrap'
import { ToastService } from '../../components/Toast'
import type { HotelResponse } from '../../types/api'
import { atualizarHotel, criarHotel } from '../../services/hotelService'
import { extrairMensagemErro } from '../../services/api'

interface HotelModalProps {
  show: boolean
  hotelEmEdicao?: HotelResponse | null
  onClose: () => void
  onSalvo: () => void
}

export function HotelModal({ show, hotelEmEdicao, onClose, onSalvo }: HotelModalProps) {
  const editando = Boolean(hotelEmEdicao)

  const [nome, setNome] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!show) return

    setNome(hotelEmEdicao?.nome ?? '')
    setLocalizacao(hotelEmEdicao?.localizacao ?? '')
    setDescricao(hotelEmEdicao?.descricao ?? '')
  }, [show, hotelEmEdicao])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!nome.trim() || !localizacao.trim()) {
      ToastService.error('Informe o nome e a localização do hotel.')
      return
    }

    setCarregando(true)

    const dados = {
      nome: nome.trim(),
      localizacao: localizacao.trim(),
      descricao: descricao.trim() || null,
    }

    try {
      if (hotelEmEdicao) {
        await atualizarHotel(hotelEmEdicao.id, dados)
        ToastService.success('Hotel atualizado.')
      } else {
        await criarHotel(dados)
        ToastService.success('Hotel cadastrado.')
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
    <Modal show={show} onHide={onClose} centered aria-labelledby="titulo-hotel">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton closeLabel="Fechar">
          <Modal.Title as="h2" id="titulo-hotel" style={{ fontSize: '1.25rem' }}>
            {editando ? 'Editar Hotel' : 'Novo Hotel'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3" controlId="hotel-nome">
            <Form.Label>Nome</Form.Label>
            <Form.Control value={nome} onChange={(e) => setNome(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="hotel-localizacao">
            <Form.Label>Localização</Form.Label>
            <Form.Control
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              placeholder="Cidade, UF"
              required
            />
          </Form.Group>

          <Form.Group controlId="hotel-descricao">
            <Form.Label>Descrição (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" disabled={carregando} aria-busy={carregando}>
            {carregando && <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />}
            {editando ? 'Salvar Alterações' : 'Cadastrar Hotel'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
