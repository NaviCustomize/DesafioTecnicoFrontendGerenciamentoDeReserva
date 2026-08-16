import styled from 'styled-components'

export const Header = styled.header`
  width: 100%;
  min-height: 6.25rem;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--verde-escuro);
  color: var(--branco);

  html.alto-contraste & {
    background-color: var(--contraste-superficie);
    border-bottom: 1px solid var(--contraste-borda);
  }

  svg {
    flex-shrink: 0;
    color: var(--branco);
  }
`

export const Titulo = styled.h1`
  margin: 0;
  color: var(--branco);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
`
