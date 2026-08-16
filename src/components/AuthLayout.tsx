import type { ReactNode } from 'react'
import { AccessibilityToolbar } from './AccessibilityToolbar'
import { useAccessibility } from '../context/AccessibilityContext'
import ilustracao from '../assets/img/grupo.svg'
import logo from '../assets/img/logo_t2m.png'
import logoModoEscuro from '../assets/img/logo-modo-escuro.png'
import {
  Wrapper,
  IllustrationPanel,
  IllustrationImage,
  FormPanel,
  FormContent,
  Logo,
  Sigla,
  Titulo,
  Subtitulo,
  FormArea,
} from './AuthLayout.styles'

interface AuthLayoutProps {
  sigla: string
  titulo: string
  subtitulo: string
  children: ReactNode
}

export function AuthLayout({ sigla, titulo, subtitulo, children }: AuthLayoutProps) {
  const { altoContraste } = useAccessibility()

  return (
    <Wrapper $altoContraste={altoContraste} className="auth-page">
      <AccessibilityToolbar />

      <IllustrationPanel $altoContraste={altoContraste} aria-hidden="true">
        <IllustrationImage src={ilustracao} alt="" />
      </IllustrationPanel>

      <FormPanel>
        <FormContent>
          <Logo src={altoContraste ? logoModoEscuro : logo} alt="Logo T2M" />

          <Sigla $altoContraste={altoContraste}>{sigla}</Sigla>
          <Titulo $altoContraste={altoContraste}>{titulo}</Titulo>
          <Subtitulo $altoContraste={altoContraste}>{subtitulo}</Subtitulo>

          <FormArea>{children}</FormArea>
        </FormContent>
      </FormPanel>
    </Wrapper>
  )
}
