import type { ReactNode } from 'react'
import { Header, Titulo } from './PageHeader.styles'

interface PageHeaderProps {
  icone: ReactNode
  titulo: string
}

export function PageHeader({ icone, titulo }: PageHeaderProps) {
  return (
    <Header>
      {icone}
      <Titulo>{titulo}</Titulo>
    </Header>
  )
}
