import { useEffect, useState, type FormEvent } from 'react'
import { Modal, Form, Button, Spinner } from 'react-bootstrap'
import { ToastService } from './Toast'
import { atualizarUsuario } from '../services/usuarioService'
import { extrairMensagemErro } from '../services/api'

interface UsuarioModalProps {
  show: boolean
  usuario: { id: number; nome: string; sobrenome: string; email: string } | null
  onClose: () => void
  onSalvo: (dados: { nome: string; sobrenome: string; email: string }) => void
}

export function UsuarioModal({ show, usuario, onClose, onSalvo }: UsuarioModalProps) {
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!show || !usuario) return

    setNome(usuario.nome)
    setSobrenome(usuario.sobrenome)
    setEmail(usuario.email)
  }, [show, usuario])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!usuario) return

    if (!nome.trim() || !sobrenome.trim()) {
      ToastService.error('Informe o nome e o sobrenome.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      ToastService.error('Informe um e-mail válido.')
      return
    }

    setCarregando(true)

    const dados = { nome: nome.trim(), sobrenome: sobrenome.trim(), email: email.trim() }

    try {
      await atualizarUsuario(usuario.id, dados)
      ToastService.success('Dados atualizados.')
      onSalvo(dados)
      onClose()
    } catch (error) {
      ToastService.error(extrairMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered aria-labelledby="titulo-usuario">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton closeLabel="Fechar">
          <Modal.Title as="h2" id="titulo-usuario" style={{ fontSize: '1.25rem' }}>
            Editar dados
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
            O e-mail é usado para entrar no sistema. Ao alterá-lo, o próximo acesso será com
            o novo endereço.
          </p>

          <Form.Group className="mb-3" controlId="usuario-nome">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="given-name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="usuario-sobrenome">
            <Form.Label>Sobrenome</Form.Label>
            <Form.Control
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              autoComplete="family-name"
              required
            />
          </Form.Group>

          <Form.Group controlId="usuario-email">
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
            Salvar Alterações
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
