import styled from 'styled-components'

export const ToolbarWrapper = styled.div`
  position: absolute;
  top: clamp(5.5rem, 11vh, 7rem);
  right: clamp(0.75rem, 1vw, 1.5rem);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;

  @media (max-width: 991.98px) {
    top: 2rem;
    right: 1.5rem;
  }

  @media (max-width: 767.98px) {
    top: 1.25rem;
    right: 1rem;
  }

  @media (min-width: 1600px) {
    top: 6rem;
    right: 1rem;
  }
`

export const ToolbarButton = styled.button<{ $altoContraste: boolean }>`
  width: clamp(2rem, 2vw, 2.65rem);
  height: clamp(1.8rem, 1.8vw, 2.35rem);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  line-height: 1;
  cursor: pointer;
  color: ${({ $altoContraste }) => ($altoContraste ? 'var(--branco)' : 'var(--preto-primario)')};

  &:hover:not(:disabled) {
    color: var(--verde-secundario);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  svg {
    width: clamp(1.35rem, 1.45vw, 1.9rem);
    height: clamp(1.35rem, 1.45vw, 1.9rem);
  }

  @media (max-width: 767.98px) {
    width: 2rem;
    height: 2rem;

    svg {
      width: 1.35rem;
      height: 1.35rem;
    }
  }

  @media (min-width: 1600px) {
    width: 2.9rem;
    height: 2.45rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`

export const FontButton = styled(ToolbarButton)`
  font-size: 1.25rem;
  font-weight: 700;
`
