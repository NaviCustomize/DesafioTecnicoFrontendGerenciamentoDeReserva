import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { RoleUsuario } from '../types/api'

interface UsuarioLogado {
  id: number
  nome: string
  sobrenome: string
  role: RoleUsuario
}

interface AuthContextValue {
  usuario: UsuarioLogado | null
  isAuthenticated: boolean

  ehAdmin: boolean
  autenticar: (token: string, usuario: UsuarioLogado) => void

  atualizarNome: (nome: string, sobrenome: string) => void
  sair: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function lerUsuarioArmazenado(): UsuarioLogado | null {
  const id = localStorage.getItem('usuarioId')
  const nome = localStorage.getItem('usuarioNome')
  const role = localStorage.getItem('usuarioRole')

  if (!id || !nome) return null

  return {
    id: Number(id),
    nome,
    sobrenome: localStorage.getItem('usuarioSobrenome') ?? '',
    role: role === 'Admin' ? 'Admin' : 'User',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(lerUsuarioArmazenado)

  const autenticar = useCallback((token: string, usuarioLogado: UsuarioLogado) => {
    localStorage.setItem('token', token)
    localStorage.setItem('usuarioId', String(usuarioLogado.id))
    localStorage.setItem('usuarioNome', usuarioLogado.nome)
    localStorage.setItem('usuarioSobrenome', usuarioLogado.sobrenome)
    localStorage.setItem('usuarioRole', usuarioLogado.role)
    setUsuario(usuarioLogado)
  }, [])

  const atualizarNome = useCallback((nome: string, sobrenome: string) => {
    localStorage.setItem('usuarioNome', nome)
    localStorage.setItem('usuarioSobrenome', sobrenome)
    setUsuario((atual) => (atual ? { ...atual, nome, sobrenome } : atual))
  }, [])

  const sair = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuarioId')
    localStorage.removeItem('usuarioNome')
    localStorage.removeItem('usuarioSobrenome')
    localStorage.removeItem('usuarioRole')
    setUsuario(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      isAuthenticated: usuario !== null,
      ehAdmin: usuario?.role === 'Admin',
      autenticar,
      atualizarNome,
      sair,
    }),
    [usuario, autenticar, atualizarNome, sair],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.')
  }

  return context
}
