import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap'
import { ICONS } from '../../components/Icons'
import { ToastService } from '../../components/Toast'
import { rotaInicialDe } from '../../components/RotaInicial'
import { AuthLayout } from '../../components/AuthLayout'
import { useAuth } from '../../context/AuthContext'
import { criarUsuario } from '../../services/usuarioService'
import { login } from '../../services/authService'
import { extrairMensagemErro } from '../../services/api'

const { AiOutlineUserAdd, MdAlternateEmail, HiOutlineLockClosed } = ICONS

export function CadastroPage() {
  const navigate = useNavigate()
  const { autenticar } = useAuth()

  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [senhasDivergem, setSenhasDivergem] = useState(false)
  const confirmarSenhaRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!nome.trim() || !sobrenome.trim() || !email.trim() || !senha.trim()) {
      ToastService.error('Preencha todos os campos para continuar.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      ToastService.error('Informe um e-mail válido.')
      return
    }

    if (senha.length < 6) {
      ToastService.error('A senha precisa ter no mínimo 6 caracteres.')
      return
    }

    if (senha !== confirmarSenha) {
      setSenhasDivergem(true)
      ToastService.error('As senhas não coincidem.')
      confirmarSenhaRef.current?.focus()
      return
    }

    setSenhasDivergem(false)
    setCarregando(true)

    try {
      await criarUsuario({ nome, sobrenome, email, senha })

      const resultado = await login({ email, senha })
      autenticar(resultado.token, {
        id: resultado.usuarioId,
        nome: resultado.nome,
        sobrenome: resultado.sobrenome,
        role: resultado.role,
      })

      ToastService.success('Cadastro realizado com sucesso!')
      navigate(rotaInicialDe(resultado.role === 'Admin'))
    } catch (error) {
      ToastService.error(extrairMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout sigla="SGR" titulo="Criar Conta" subtitulo="Cadastre-se para gerenciar suas reservas">
      <Form noValidate onSubmit={handleSubmit}>
        <Form.Group className="auth-campo" controlId="cadastro-nome">
          <Form.Label>Nome</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <AiOutlineUserAdd aria-hidden="true" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Nome"

              autoComplete="given-name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </InputGroup>
        </Form.Group>

        <Form.Group className="auth-campo" controlId="cadastro-sobrenome">
          <Form.Label>Sobrenome</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <AiOutlineUserAdd aria-hidden="true" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Sobrenome"
              autoComplete="family-name"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              required
            />
          </InputGroup>
        </Form.Group>

        <Form.Group className="auth-campo" controlId="cadastro-email">
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

        <Form.Group className="auth-campo" controlId="cadastro-senha">
          <Form.Label>Senha</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <HiOutlineLockClosed aria-hidden="true" />
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="Senha"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
              aria-describedby="ajuda-senha"
            />
          </InputGroup>
          <Form.Text id="ajuda-senha" className="d-block mt-1">
            Mínimo de 6 caracteres.
          </Form.Text>
        </Form.Group>

        <Form.Group className="auth-campo auth-campo--final" controlId="cadastro-confirmar-senha">
          <Form.Label>Confirmar senha</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <HiOutlineLockClosed aria-hidden="true" />
            </InputGroup.Text>
            <Form.Control
              ref={confirmarSenhaRef}
              type="password"
              placeholder="Confirmar senha"
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(e) => {
                setConfirmarSenha(e.target.value)
                setSenhasDivergem(false)
              }}
              minLength={6}
              required
              aria-invalid={senhasDivergem}
              aria-describedby={senhasDivergem ? 'erro-confirmar-senha' : undefined}
            />
          </InputGroup>
          <div aria-live="polite">
            {senhasDivergem && (
              <Form.Text id="erro-confirmar-senha" className="d-block mt-1 text-danger">
                As senhas não coincidem.
              </Form.Text>
            )}
          </div>
        </Form.Group>

        <Button type="submit" variant="success" disabled={carregando} aria-busy={carregando}>
          {carregando && <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />}
          Cadastrar
        </Button>

        <p className="auth-rodape">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </Form>
    </AuthLayout>
  )
}
