import styled from 'styled-components'

export const Wrapper = styled.main<{ $altoContraste: boolean }>`
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  font-size: 1.125rem;
  background-color: ${({ $altoContraste }) => ($altoContraste ? 'var(--contraste-fundo)' : 'var(--branco)')};
  transition: background-color 0.2s;

  @media (max-width: 767.98px) {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }
`

export const IllustrationPanel = styled.div<{ $altoContraste: boolean }>`
  flex: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 2vw, 2.5rem);
  padding-left: clamp(2rem, 4vw, 5rem);
  background-color: ${({ $altoContraste }) => ($altoContraste ? 'var(--contraste-fundo)' : 'var(--branco)')};
  transition: background-color 0.2s;

  @media (max-width: 767.98px) {
    display: none;
  }
`

export const IllustrationImage = styled.img`
  width: clamp(620px, 78%, 860px);
  max-width: 95%;
  height: auto;
  object-fit: contain;

  @media (max-width: 1199.98px) {
    width: clamp(420px, 78%, 620px);
    max-width: 92%;
  }

  @media (min-width: 1600px) {
    width: clamp(720px, 80%, 920px);
  }
`

export const FormPanel = styled.div`
  flex: 1;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 3vw, 3rem);
  overflow-y: auto;

  @media (max-width: 767.98px) {
    min-height: auto;
    overflow-y: visible;
    padding: 4rem 1.25rem 2rem;
  }
`

export const FormContent = styled.div`
  width: 100%;
  max-width: 31.25rem;
  margin-left: clamp(1.5rem, 4vw, 5rem);
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 991.98px) {
    max-width: 23.75rem;
    margin-left: 0;
  }

  @media (max-width: 767.98px) {
    max-width: 21.25rem;
  }

  @media (min-width: 1600px) {
    max-width: 41.25rem;
  }
`

export const Logo = styled.img`
  width: clamp(220px, 13vw, 270px);
  max-width: 100%;
  height: auto;
  object-fit: contain;
  margin-bottom: 1.25rem;

  @media (max-width: 1199.98px) {
    width: 200px;
    margin-bottom: 1.75rem;
  }

  @media (max-width: 767.98px) {
    width: 160px;
    margin-bottom: 1.25rem;
  }
`

export const Sigla = styled.p<{ $altoContraste: boolean }>`
  margin: 0 0 0.5rem;
  color: var(--verde-escuro);
  font-size: 2rem;
  font-weight: 400;
  line-height: 3rem;
  text-align: center;

  ${({ $altoContraste }) => $altoContraste && 'color: var(--verde-primario);'}
`

export const Titulo = styled.h1<{ $altoContraste: boolean }>`
  margin-bottom: 0.5em;
  color: var(--preto-primario);
  font-size: 1.5em;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;

  ${({ $altoContraste }) => $altoContraste && 'color: var(--branco);'}
`

export const Subtitulo = styled.p<{ $altoContraste: boolean }>`
  margin-bottom: 1.25em;
  color: var(--cinza-primario);
  font-size: 1.125em;
  font-weight: 400;
  line-height: 1.35;
  text-align: center;

  ${({ $altoContraste }) => $altoContraste && 'color: var(--branco);'}

  @media (max-width: 991.98px) {
    font-size: 1em;
    margin-bottom: 1.5em;
  }
`

export const FormArea = styled.div`
  width: 100%;
  margin-top: 0.75rem;
`
