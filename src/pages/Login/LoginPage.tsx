import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap'
import { ICONS } from '../../components/Icons'
import { ToastService } from '../../components/Toast'
import { rotaInicialDe } from '../../components/RotaInicial'
import { AuthLayout } from '../../components/AuthLayout'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../services/authService'
import { extrairMensagemErro, CHAVE_SESSAO_EXPIRADA } from '../../services/api'

const { MdAlternateEmail, HiOutlineLockClosed, BsEye, BsEyeSlash } = ICONS

let avisoSessaoExibido = false

export function LoginPage() {
  const navigate = useNavigate()
  const { autenticar } = useAuth()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (avisoSessaoExibido || sessionStorage.getItem(CHAVE_SESSAO_EXPIRADA) !== 'true') {
      return
    }

    avisoSessaoExibido = true
    sessionStorage.removeItem(CHAVE_SESSAO_EXPIRADA)

    setTimeout(() => {
      ToastService.warning('Sua sessão expirou. Entre novamente para continuar.')
    }, 0)
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!email.trim() || !senha.trim()) {
      ToastService.error('Preencha e-mail e senha para continuar.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      ToastService.error('Informe um e-mail válido.')
      return
    }

    setCarregando(true)

    try {
      const resultado = await login({ email, senha })
      autenticar(resultado.token, {
        id: resultado.usuarioId,
        nome: resultado.nome,
        sobrenome: resultado.sobrenome,
        role: resultado.role,
      })
      ToastService.success(`Bem-vindo, ${resultado.nome}!`)
      navigate(rotaInicialDe(resultado.role === 'Admin'))
    } catch (error) {
      ToastService.error(extrairMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout
      sigla="SGR"
      titulo="Sistema de Gerenciamento de Reservas"
      subtitulo="Entre com sua conta para continuar"
    >
      <Form noValidate onSubmit={handleSubmit}>
        <Form.Group className="auth-campo" controlId="login-email">
          <Form.Label>E-mail</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <MdAlternateEmail aria-hidden="true" />
            </InputGroup.Text>
            <Form.Control
              type="email"
              placeholder="E-mail"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
        </Form.Group>

        <Form.Group className="auth-campo auth-campo--final" controlId="login-senha">
          <Form.Label>Senha</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <HiOutlineLockClosed aria-hidden="true" />
            </InputGroup.Text>
            <Form.Control
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Senha"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="outline-secondary"
              className="auth-toggle-senha"
              onClick={() => setMostrarSenha((atual) => !atual)}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={mostrarSenha}
            >
              {mostrarSenha ? (
                <BsEyeSlash aria-hidden="true" />
              ) : (
                <BsEye aria-hidden="true" />
              )}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button type="submit" variant="success" disabled={carregando} aria-busy={carregando}>
          {carregando && <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />}
          Entrar
        </Button>

        <p className="auth-rodape">
          Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </Form>
    </AuthLayout>
  )
}
