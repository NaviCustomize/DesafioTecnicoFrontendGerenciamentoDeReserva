import type { ReactNode } from 'react'
import styled from 'styled-components'

interface SidebarItemProps {
  icone: ReactNode
  rotulo: string
  expandido: boolean
  onClick?: () => void
  disabled?: boolean
  ariaLabel?: string
  ativo?: boolean
  ariaPressed?: boolean
  ariaCurrent?: boolean
  ariaExpanded?: boolean
}

const Item = styled.button<{ $expandido: boolean; $ativo?: boolean }>`
  width: 100%;
  min-height: ${({ $expandido }) => ($expandido ? '2.5rem' : '3.625rem')};
  padding: ${({ $expandido }) => ($expandido ? '0.25rem 1.375rem' : '0.25rem 0.5rem')};
  display: flex;
  flex-direction: ${({ $expandido }) => ($expandido ? 'row' : 'column')};
  align-items: center;
  justify-content: ${({ $expandido }) => ($expandido ? 'flex-start' : 'center')};
  gap: ${({ $expandido }) => ($expandido ? '0.75rem' : '0.125rem')};
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: ${({ $expandido }) => ($expandido ? 'left' : 'center')};
  -webkit-tap-highlight-color: transparent;

  svg,
  span {
    color: ${({ $ativo }) => ($ativo ? 'var(--verde-escuro)' : 'var(--cinza-secundario)')};
    font-weight: ${({ $ativo, $expandido }) => ($ativo && $expandido ? '600' : 'inherit')};
  }

  svg {
    flex-shrink: 0;
  }

  span {
    max-width: ${({ $expandido }) => ($expandido ? '14.375rem' : '6.875rem')};
    font-size: 1rem;
    font-weight: ${({ $expandido }) => ($expandido ? '400' : '700')};
    line-height: 1.5;
    word-break: keep-all;
  }

  &:hover:not(:disabled) svg,
  &:hover:not(:disabled) span {
    color: var(--verde-escuro);
  }

  &:focus-visible {
    outline-offset: -3px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  html.alto-contraste & svg,
  html.alto-contraste & span {
    color: var(--branco);
  }

  html.alto-contraste &:hover:not(:disabled) svg,
  html.alto-contraste &:hover:not(:disabled) span {
    color: var(--cinza-claro);
  }

  html.alto-contraste &:focus-visible {
    outline-color: var(--branco);
  }
`

export function SidebarItem({
  icone,
  rotulo,
  expandido,
  onClick,
  disabled,
  ariaLabel,
  ativo,
  ariaPressed,
  ariaCurrent,
  ariaExpanded,
}: SidebarItemProps) {
  return (
    <Item
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={rotulo}
      aria-label={ariaLabel ?? rotulo}
      aria-pressed={ariaPressed}
      aria-current={ariaCurrent ? 'page' : undefined}
      aria-expanded={ariaExpanded}
      $expandido={expandido}
      $ativo={ativo}
    >
      {icone}
      <span>{rotulo}</span>
    </Item>
  )
}
