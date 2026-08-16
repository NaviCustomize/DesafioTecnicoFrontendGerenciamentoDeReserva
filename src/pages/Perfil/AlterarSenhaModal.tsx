import { useEffect, useState, type FormEvent } from 'react'
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap'
import { ToastService } from '../../components/Toast'
import { ICONS } from '../../components/Icons'
import { alterarSenha } from '../../services/usuarioService'
import { extrairMensagemErro } from '../../services/api'

const { BsEye, BsEyeSlash } = ICONS

interface AlterarSenhaModalProps {
  show: boolean
  usuarioId: number
  onClose: () => void

  onSenhaAlterada: () => void
}

export function AlterarSenhaModal({
  show,
  usuarioId,
  onClose,
  onSenhaAlterada,
}: AlterarSenhaModalProps) {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [mostrarSenhas, setMostrarSenhas] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (show) return

    setSenhaAtual('')
    setNovaSenha('')
    setConfirmacao('')
    setMostrarSenhas(false)
    setConfirmando(false)
  }, [show])

  function validar(): boolean {
    if (!senhaAtual || !novaSenha || !confirmacao) {
      ToastService.error('Preencha todos os campos.')
      return false
    }

    if (novaSenha.length < 6) {
      ToastService.error('A nova senha precisa ter no mínimo 6 caracteres.')
      return false
    }

    if (novaSenha !== confirmacao) {
      ToastService.error('A nova senha e a confirmação não coincidem.')
      return false
    }

    if (novaSenha === senhaAtual) {
      ToastService.error('A nova senha precisa ser diferente da atual.')
      return false
    }

    return true
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (validar()) {
      setConfirmando(true)
    }
  }

  async function confirmarTroca() {
    setCarregando(true)

    try {
      await alterarSenha(usuarioId, { senhaAtual, novaSenha })
      onSenhaAlterada()
    } catch (error) {
      ToastService.error(extrairMensagemErro(error))
      setConfirmando(false)
    } finally {
      setCarregando(false)
    }
  }

  const tipoCampo = mostrarSenhas ? 'text' : 'password'

  return (
    <Modal show={show} onHide={onClose} centered aria-labelledby="titulo-senha">
      {confirmando ? (
        <>
          <Modal.Header closeButton closeLabel="Fechar">
            <Modal.Title as="h2" id="titulo-senha" style={{ fontSize: '1.25rem' }}>
              Confirmar alteração de senha
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Alert variant="warning" className="mb-0">
              Ao alterar a senha, <strong>sua sessão será encerrada</strong> e você precisará
              entrar novamente com a nova senha. Deseja continuar?
            </Alert>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setConfirmando(false)} autoFocus>
              Voltar
            </Button>
            <Button
              variant="success"
              onClick={confirmarTroca}
              disabled={carregando}
              aria-busy={carregando}
            >
              {carregando && (
                <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />
              )}
              Alterar e sair
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <Form noValidate onSubmit={handleSubmit}>
          <Modal.Header closeButton closeLabel="Fechar">
            <Modal.Title as="h2" id="titulo-senha" style={{ fontSize: '1.25rem' }}>
              Alterar senha
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3" controlId="senha-atual">
              <Form.Label>Senha atual</Form.Label>
              <Form.Control
                type={tipoCampo}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="senha-nova">
              <Form.Label>Nova senha</Form.Label>
              <Form.Control
                type={tipoCampo}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
                aria-describedby="ajuda-nova-senha"
              />
              <Form.Text id="ajuda-nova-senha" className="d-block mt-1">
                Mínimo de 6 caracteres.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="senha-confirmacao">
              <Form.Label>Confirmar nova senha</Form.Label>
              <Form.Control
                type={tipoCampo}
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </Form.Group>

            <Button
              type="button"
              variant="link"
              className="p-0"
              onClick={() => setMostrarSenhas((atual) => !atual)}
              aria-pressed={mostrarSenhas}
            >
              {mostrarSenhas ? (
                <BsEyeSlash className="me-1" aria-hidden="true" />
              ) : (
                <BsEye className="me-1" aria-hidden="true" />
              )}
              {mostrarSenhas ? 'Ocultar senhas' : 'Mostrar senhas'}
            </Button>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="outline-secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              Continuar
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  )
}
