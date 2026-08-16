import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar, SIDEBAR_WIDTH_EXPANDIDO, SIDEBAR_WIDTH_RETRAIDO } from '../components/Sidebar/Sidebar'
import { ContentArea, ConteudoPagina } from '../components/Sidebar/Sidebar.styles'
import { PageHeader } from '../components/PageHeader'

interface AppLayoutProps {
  titulo: string

  icone: ReactNode

  tituloDocumento?: string
  children: ReactNode
}

export function AppLayout({ titulo, icone, tituloDocumento, children }: AppLayoutProps) {
  const [expandido, setExpandido] = useState(true)
  const location = useLocation()
  const conteudoRef = useRef<HTMLElement>(null)
  const primeiraRenderizacao = useRef(true)

  useEffect(() => {
    document.title = `${tituloDocumento ?? titulo} | Sistema de Gerenciamento de Reservas`
  }, [titulo, tituloDocumento])

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false
      return
    }

    conteudoRef.current?.focus()
  }, [location.pathname])

  return (
    <>
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteúdo
      </a>

      <Sidebar expandido={expandido} onAlternarExpandido={() => setExpandido((atual) => !atual)} />

      <ContentArea
        ref={conteudoRef}
        id="conteudo-principal"
        tabIndex={-1}
        $sidebarWidth={expandido ? SIDEBAR_WIDTH_EXPANDIDO : SIDEBAR_WIDTH_RETRAIDO}
      >
        <PageHeader icone={icone} titulo={titulo} />

        <ConteudoPagina>{children}</ConteudoPagina>
      </ContentArea>
    </>
  )
}
