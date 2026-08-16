import styled from 'styled-components'

export const GradeIndicadores = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

export const Cartao = styled.div`
  background-color: var(--branco);
  border: 1px solid var(--branco-secundario);
  border-radius: 6px;
  padding: 1.25rem;

  html.alto-contraste & {
    background-color: var(--contraste-superficie);
    border-color: var(--contraste-borda);
    color: var(--branco);
  }
`

export const RotuloIndicador = styled.span`
  display: block;
  font-size: 0.875rem;
  color: var(--cinza-primario);
  margin-bottom: 0.35rem;

  html.alto-contraste & {
    color: var(--branco);
  }
`

export const ValorIndicador = styled.strong`
  display: block;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  color: var(--verde-escuro);

  html.alto-contraste & {
    color: var(--branco);
  }
`

export const DetalheIndicador = styled.span`
  display: block;
  font-size: 0.8125rem;
  color: var(--cinza-primario);
  margin-top: 0.25rem;

  html.alto-contraste & {
    color: var(--branco);
  }
`

export const Barra = styled.div`
  height: 0.625rem;
  border-radius: 999px;
  background-color: var(--branco-secundario);
  overflow: hidden;
  margin-top: 0.75rem;

  html.alto-contraste & {
    background-color: var(--contraste-fundo);
    border: 1px solid var(--contraste-borda);
  }
`

export const BarraPreenchida = styled.div<{ $percentual: number }>`
  height: 100%;
  width: ${({ $percentual }) => $percentual}%;
  background-color: var(--verde-escuro);
  transition: width 0.3s ease;

  html.alto-contraste & {
    background-color: var(--branco);
  }
`

export const ListaStatus = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
`

export const ItemStatus = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-variant-numeric: tabular-nums;
`
