import { useEffect, useState, type FormEvent } from 'react'
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap'
import { ToastService } from '../../components/Toast'
import { encerrarPropriaConta } from '../../services/usuarioService'
import { extrairMensagemErro } from '../../services/api'

interface EncerrarContaModalProps {
  show: boolean
  usuarioId: number
  onClose: () => void
  onContaEncerrada: () => void
}

export function EncerrarContaModal({
  show,
  usuarioId,
  onClose,
  onContaEncerrada,
}: EncerrarContaModalProps) {
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!show) setSenha('')
  }, [show])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!senha) {
      ToastService.error('Informe sua senha para confirmar.')
      return
    }

    setCarregando(true)

    try {
      await encerrarPropriaConta(usuarioId, { senha })
      onContaEncerrada()
    } catch (error) {
      ToastService.error(extrairMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered aria-labelledby="titulo-encerrar-conta">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton closeLabel="Fechar">
          <Modal.Title as="h2" id="titulo-encerrar-conta" style={{ fontSize: '1.25rem' }}>
            Encerrar minha conta
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="danger">
            Sua conta deixará de existir para você: o acesso é encerrado e você não conseguirá
            mais entrar com este e-mail. <strong>Suas reservas permanecem registradas</strong> no
            histórico do hotel.
          </Alert>

          <Form.Group controlId="encerrar-senha">
            <Form.Label>Digite sua senha para confirmar</Form.Label>
            <Form.Control
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} autoFocus>
            Manter minha conta
          </Button>
          <Button type="submit" variant="danger" disabled={carregando} aria-busy={carregando}>
            {carregando && (
              <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />
            )}
            Encerrar conta
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
