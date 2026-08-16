import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function rotaInicialDe(ehAdmin: boolean): string {
  return ehAdmin ? '/painel' : '/reservas'
}

export function RotaInicial() {
  const { isAuthenticated, ehAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={rotaInicialDe(ehAdmin)} replace />
}
