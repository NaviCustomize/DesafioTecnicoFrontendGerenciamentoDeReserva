import styled from 'styled-components'

export const SIDEBAR_WIDTH_EXPANDIDO = '20rem'
export const SIDEBAR_WIDTH_RETRAIDO = '7.5rem'

export const Aside = styled.aside<{ $expandido: boolean; $altoContraste: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ $expandido }) => ($expandido ? SIDEBAR_WIDTH_EXPANDIDO : SIDEBAR_WIDTH_RETRAIDO)};
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ $altoContraste }) =>
    $altoContraste ? 'var(--contraste-superficie)' : 'var(--branco)'};
  border-right: 1px solid
    ${({ $altoContraste }) => ($altoContraste ? 'var(--contraste-borda)' : 'var(--branco-secundario)')};
  transition: width 0.3s ease;
  z-index: 20;
  overflow-x: hidden;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ $altoContraste }) => ($altoContraste ? 'var(--branco)' : 'var(--cinza-claro)')};
    border-radius: 10px;
  }
`

export const LogoArea = styled.div<{ $expandido: boolean }>`
  width: 100%;
  padding: ${({ $expandido }) => ($expandido ? '0.25rem 1.125rem 0' : '1rem 0.5rem 0.75rem')};
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const LogoImg = styled.img`
  width: 5.375rem;
  height: auto;
  object-fit: contain;
`

export const NomeSistema = styled.span<{ $expandido: boolean; $altoContraste: boolean }>`
  width: 100%;
  margin-top: ${({ $expandido }) => ($expandido ? '0.25rem' : '0.625rem')};
  font-size: 1.375rem;
  font-weight: ${({ $expandido }) => ($expandido ? '400' : '700')};
  line-height: 1.55;
  text-align: center;
  color: ${({ $altoContraste }) => ($altoContraste ? 'var(--branco)' : 'var(--preto-primario)')};
`

export const NavSection = styled.nav<{ $expandido: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ $expandido }) => ($expandido ? '0' : '0.5rem')};
`

export const AccessibilityNav = styled(NavSection)`
  margin-top: ${({ $expandido }) => ($expandido ? '2.125rem' : '0.625rem')};

  & > button:last-child {
    margin-top: ${({ $expandido }) => ($expandido ? '2.875rem' : '0.25rem')};
  }
`

export const MainNav = styled(NavSection)`
  margin-top: ${({ $expandido }) => ($expandido ? '2.75rem' : '0.5rem')};
`

export const BottomNav = styled(NavSection)`
  margin-bottom: ${({ $expandido }) => ($expandido ? '1rem' : '0.75rem')};
`

export const Spacer = styled.div`
  flex: 1;
`

export const ProfileCard = styled.button`
  width: calc(100% - 0.875rem);
  min-height: 3.8125rem;
  margin: 1.375rem 0.4375rem 0.875rem;
  padding: 0.5rem 1.125rem;
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr);
  column-gap: 0.875rem;
  align-items: center;
  border: none;
  border-radius: 5px;
  background-color: var(--verde-escuro);
  color: var(--branco);
  cursor: pointer;
  text-align: left;

  &:hover {
    opacity: 0.9;
  }

  svg {
    justify-self: center;
    flex-shrink: 0;
    color: var(--branco);
  }

  html.alto-contraste & {
    background-color: var(--branco);
    color: var(--preto-primario);
  }

  html.alto-contraste & svg {
    color: var(--preto-primario);
  }
`

export const ProfileInfo = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.3;

  strong {
    width: 100%;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    width: 100%;
    font-size: 1rem;
    font-weight: 200;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export const ContentArea = styled.main<{ $sidebarWidth: string }>`
  margin-left: ${({ $sidebarWidth }) => $sidebarWidth};
  min-height: 100vh;
  transition: margin-left 0.3s ease;
`

export const ConteudoPagina = styled.div`
  padding: 2rem;

  @media (max-width: 767.98px) {
    padding: 1.25rem;
  }
`
