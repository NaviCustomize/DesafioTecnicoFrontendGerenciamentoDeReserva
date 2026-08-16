import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Spinner, Badge } from 'react-bootstrap'
import { AppLayout } from '../../layout/AppLayout'
import { ICONS, ICON_SIZES } from '../../components/Icons'
import { ToastService } from '../../components/Toast'
import { UsuarioModal } from '../../components/UsuarioModal'
import { AlterarSenhaModal } from './AlterarSenhaModal'
import { EncerrarContaModal } from './EncerrarContaModal'
import { useAuth } from '../../context/AuthContext'
import type { UsuarioResponse } from '../../types/api'
import { buscarUsuarioPorId } from '../../services/usuarioService'
import { extrairMensagemErro } from '../../services/api'
import { nomeCompleto } from '../../utils/usuario'

const { BiUserCircle, MdOutlineEdit, HiOutlineLockClosed, AiOutlineUserDelete } = ICONS

const ID_TOAST_PERFIL = 'erro-carregar-perfil'

export function PerfilPage() {
  const { usuario, ehAdmin, atualizarNome, sair } = useAuth()
  const navigate = useNavigate()

  const [dados, setDados] = useState<UsuarioResponse | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [falhou, setFalhou] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalSenha, setModalSenha] = useState(false)
  const [modalEncerrar, setModalEncerrar] = useState(false)

  function encerrarSessao(mensagem: string) {
    sair()
    ToastService.info(mensagem)
    navigate('/login')
  }

  const carregarDados = useCallback(async () => {
    if (!usuario) return

    setCarregando(true)
    setFalhou(false)
    ToastService.dispensar(ID_TOAST_PERFIL)

    try {
      setDados(await buscarUsuarioPorId(usuario.id))
    } catch (error) {
      setFalhou(true)
      ToastService.errorPersistente(extrairMensagemErro(error), ID_TOAST_PERFIL)
    } finally {
      setCarregando(false)
    }
  }, [usuario])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  return (
    <AppLayout titulo="Perfil" icone={<BiUserCircle size={ICON_SIZES.header} aria-hidden="true" />}>
      {carregando && (
        <div className="text-center py-5" role="status" aria-live="polite">
          <Spinner animation="border" style={{ color: 'var(--verde-escuro)' }} aria-hidden="true" />
          <span className="visually-hidden">Carregando perfil...</span>
        </div>
      )}

      {!carregando && falhou && (
        <div className="text-center py-5">
          <p className="mb-3">Não foi possível carregar seus dados.</p>
          <Button variant="outline-success" onClick={carregarDados}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!carregando && !falhou && dados && (
        <Card className="shadow-sm" style={{ maxWidth: '32rem', border: 'none' }}>
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                style={{
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--verde-escuro)',
                  color: 'var(--branco)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BiUserCircle size="1.75rem" aria-hidden="true" />
              </div>

              <div style={{ minWidth: 0 }}>
                <Card.Title as="h2" className="mb-1" style={{ fontSize: '1.15rem' }}>
                  {nomeCompleto(dados)}
                </Card.Title>
                <Badge className={ehAdmin ? 'badge-status-confirmada' : 'badge-status-finalizada'}>
                  {ehAdmin ? 'Administrador' : 'Usuário'}
                </Badge>
              </div>
            </div>

            <dl className="mb-4">
              <dt style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--cinza-primario)' }}>
                E-mail
              </dt>
              <dd className="mb-0" style={{ wordBreak: 'break-word' }}>
                {dados.email}
              </dd>
            </dl>

            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline-success" onClick={() => setModalAberto(true)}>
                <MdOutlineEdit className="me-1" aria-hidden="true" />
                Editar dados
              </Button>

              <Button variant="outline-success" onClick={() => setModalSenha(true)}>
                <HiOutlineLockClosed className="me-1" aria-hidden="true" />
                Alterar senha
              </Button>
            </div>

            <hr className="my-4" />

            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Encerrar conta</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Você perde o acesso ao sistema e não consegue mais entrar com este e-mail.
            </p>

            <Button variant="outline-danger" onClick={() => setModalEncerrar(true)}>
              <AiOutlineUserDelete className="me-1" aria-hidden="true" />
              Encerrar minha conta
            </Button>
          </Card.Body>
        </Card>
      )}

      {dados && (
        <>
          <AlterarSenhaModal
            show={modalSenha}
            usuarioId={dados.id}
            onClose={() => setModalSenha(false)}
            onSenhaAlterada={() =>
              encerrarSessao('Senha alterada. Entre novamente com a nova senha.')
            }
          />

          <EncerrarContaModal
            show={modalEncerrar}
            usuarioId={dados.id}
            onClose={() => setModalEncerrar(false)}
            onContaEncerrada={() => encerrarSessao('Sua conta foi encerrada.')}
          />
        </>
      )}

      <UsuarioModal
        show={modalAberto}
        usuario={dados}
        onClose={() => setModalAberto(false)}
        onSalvo={({ nome, sobrenome }) => {
          atualizarNome(nome, sobrenome)
          carregarDados()
        }}
      />
    </AppLayout>
  )
}
