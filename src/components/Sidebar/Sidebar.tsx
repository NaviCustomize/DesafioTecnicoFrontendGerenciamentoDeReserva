import { useLocation, useNavigate } from 'react-router-dom'
import { ICONS, ICON_SIZES } from '../Icons'
import { ToastService } from '../Toast'
import { nomeCompleto } from '../../utils/usuario'
import { useAccessibility } from '../../context/AccessibilityContext'
import { useAuth } from '../../context/AuthContext'
import { SidebarItem } from './SidebarItem'
import logo from '../../assets/img/logo_t2m.png'
import logoModoEscuro from '../../assets/img/logo-modo-escuro.png'
import {
  Aside,
  LogoArea,
  LogoImg,
  NomeSistema,
  AccessibilityNav,
  MainNav,
  BottomNav,
  Spacer,
  ProfileCard,
  ProfileInfo,
  SIDEBAR_WIDTH_EXPANDIDO,
  SIDEBAR_WIDTH_RETRAIDO,
} from './Sidebar.styles'

export { SIDEBAR_WIDTH_EXPANDIDO, SIDEBAR_WIDTH_RETRAIDO }

const {
  MdContrast,
  MdOutlineTextIncrease,
  MdOutlineTextDecrease,
  BsArrowBarLeft,
  BsArrowBarRight,
  CgHome,
  BiUserCircle,
  MdEventNote,
  AiOutlineTable,
  FaWpforms,
  MdOutlineExitToApp,
} = ICONS

const tamanhoIcone = ICON_SIZES.sidebar

export function Sidebar({
  expandido,
  onAlternarExpandido,
}: {
  expandido: boolean
  onAlternarExpandido: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario, ehAdmin, sair } = useAuth()
  const { altoContraste, alternarContraste, podeAumentarFonte, podeDiminuirFonte, aumentarFonte, diminuirFonte } =
    useAccessibility()

  function irPara(rota: string) {
    window.scrollTo(0, 0)
    navigate(rota)
  }

  function handleSair() {
    sair()
    ToastService.info('Você saiu do sistema.')
    navigate('/login')
  }

  return (
    <Aside $expandido={expandido} $altoContraste={altoContraste}>
      <LogoArea $expandido={expandido}>
        <LogoImg src={altoContraste ? logoModoEscuro : logo} alt="T2M" />
        <NomeSistema $expandido={expandido} $altoContraste={altoContraste}>
          {expandido ? 'Sistema de Gerenciamento de Reservas' : 'SGR'}
        </NomeSistema>
      </LogoArea>

      <AccessibilityNav as="div" role="group" $expandido={expandido} aria-label="Preferências de acessibilidade">
        <SidebarItem
          icone={<MdContrast size={tamanhoIcone} aria-hidden="true" />}
          rotulo={expandido ? 'Alto Contraste' : 'Contraste'}
          expandido={expandido}
          onClick={alternarContraste}
          ativo={altoContraste}
          ariaPressed={altoContraste}
          ariaLabel={altoContraste ? 'Desativar alto contraste' : 'Ativar alto contraste'}
        />

        <SidebarItem
          icone={<MdOutlineTextIncrease size={tamanhoIcone} aria-hidden="true" />}
          rotulo={expandido ? 'Aumentar Fonte' : 'Aumentar'}
          expandido={expandido}
          onClick={aumentarFonte}
          disabled={!podeAumentarFonte}
          ariaLabel="Aumentar fonte"
        />

        <SidebarItem
          icone={<MdOutlineTextDecrease size={tamanhoIcone} aria-hidden="true" />}
          rotulo={expandido ? 'Diminuir Fonte' : 'Diminuir'}
          expandido={expandido}
          onClick={diminuirFonte}
          disabled={!podeDiminuirFonte}
          ariaLabel="Diminuir fonte"
        />

        <SidebarItem
          icone={
            expandido ? (
              <BsArrowBarLeft size={tamanhoIcone} aria-hidden="true" />
            ) : (
              <BsArrowBarRight size={tamanhoIcone} aria-hidden="true" />
            )
          }
          rotulo={expandido ? 'Retrair' : 'Expandir'}
          expandido={expandido}
          onClick={onAlternarExpandido}
          ariaLabel={expandido ? 'Retrair menu lateral' : 'Expandir menu lateral'}
          ariaExpanded={expandido}
        />
      </AccessibilityNav>

      <MainNav $expandido={expandido} aria-label="Navegação principal">
        {!ehAdmin && (
          <>
            <SidebarItem
              icone={<CgHome size={tamanhoIcone} aria-hidden="true" />}
              rotulo="Início"
              expandido={expandido}
              onClick={() => irPara('/reservas')}
              ativo={location.pathname === '/reservas'}
              ariaCurrent={location.pathname === '/reservas'}
            />

            <SidebarItem
              icone={<MdEventNote size={tamanhoIcone} aria-hidden="true" />}
              rotulo="Histórico"
              expandido={expandido}
              onClick={() => irPara('/historico')}
              ativo={location.pathname === '/historico'}
              ariaCurrent={location.pathname === '/historico'}
            />
          </>
        )}

        {ehAdmin && (
          <>
            <SidebarItem
              icone={<AiOutlineTable size={tamanhoIcone} aria-hidden="true" />}
              rotulo="Painel"
              expandido={expandido}
              onClick={() => irPara('/painel')}
              ativo={location.pathname === '/painel'}
              ariaCurrent={location.pathname === '/painel'}
            />

            <SidebarItem
              icone={<FaWpforms size={tamanhoIcone} aria-hidden="true" />}
              rotulo={expandido ? 'Administração' : 'Admin'}
              expandido={expandido}
              onClick={() => irPara('/admin')}
              ativo={location.pathname === '/admin'}
              ariaCurrent={location.pathname === '/admin'}
              ariaLabel="Administração"
            />
          </>
        )}

        {!expandido && (
          <SidebarItem
            icone={<BiUserCircle size={tamanhoIcone} aria-hidden="true" />}
            rotulo="Perfil"
            expandido={expandido}
            onClick={() => irPara('/perfil')}
            ativo={location.pathname === '/perfil'}
            ariaCurrent={location.pathname === '/perfil'}
          />
        )}
      </MainNav>

      <Spacer />

      {expandido && (
        <ProfileCard
          type="button"
          onClick={() => irPara('/perfil')}
          aria-current={location.pathname === '/perfil' ? 'page' : undefined}
        >
          <BiUserCircle size="1.75rem" aria-hidden="true" />
          <ProfileInfo>
            <strong>{usuario ? nomeCompleto(usuario) : 'Usuário'}</strong>
            <span>Ver perfil</span>
          </ProfileInfo>
        </ProfileCard>
      )}

      <BottomNav as="div" $expandido={expandido}>
        <SidebarItem
          icone={<MdOutlineExitToApp size={tamanhoIcone} aria-hidden="true" />}
          rotulo="Sair"
          expandido={expandido}
          onClick={handleSair}
        />
      </BottomNav>
    </Aside>
  )
}
