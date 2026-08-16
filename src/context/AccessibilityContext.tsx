import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const TAMANHOS_FONTE = [14, 16, 18, 20]
const INDICE_PADRAO = 1

const CHAVE_FONTE = 'sgr:indice-fonte'
const CHAVE_CONTRASTE = 'sgr:alto-contraste'

function lerIndiceFonteSalvo(): number {
  const bruto = localStorage.getItem(CHAVE_FONTE)

  if (bruto === null) {
    return INDICE_PADRAO
  }

  const salvo = Number(bruto)

  if (!Number.isInteger(salvo) || salvo < 0 || salvo >= TAMANHOS_FONTE.length) {
    return INDICE_PADRAO
  }

  return salvo
}

function lerContrasteSalvo(): boolean {
  return localStorage.getItem(CHAVE_CONTRASTE) === 'true'
}

interface AccessibilityContextValue {
  altoContraste: boolean
  alternarContraste: () => void
  tamanhoFonte: number
  podeAumentarFonte: boolean
  podeDiminuirFonte: boolean
  aumentarFonte: () => void
  diminuirFonte: () => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [altoContraste, setAltoContraste] = useState(lerContrasteSalvo)
  const [indiceFonte, setIndiceFonte] = useState(lerIndiceFonteSalvo)

  useEffect(() => {
    document.documentElement.classList.toggle('alto-contraste', altoContraste)
    localStorage.setItem(CHAVE_CONTRASTE, String(altoContraste))
  }, [altoContraste])

  useEffect(() => {
    const tamanho = TAMANHOS_FONTE[indiceFonte]

    document.documentElement.style.fontSize = `${tamanho}px`
    document.documentElement.style.setProperty('--fonte-base', `${tamanho}px`)
    localStorage.setItem(CHAVE_FONTE, String(indiceFonte))
  }, [indiceFonte])

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      altoContraste,
      alternarContraste: () => setAltoContraste((atual) => !atual),
      tamanhoFonte: TAMANHOS_FONTE[indiceFonte],
      podeAumentarFonte: indiceFonte < TAMANHOS_FONTE.length - 1,
      podeDiminuirFonte: indiceFonte > 0,
      aumentarFonte: () => setIndiceFonte((atual) => Math.min(atual + 1, TAMANHOS_FONTE.length - 1)),
      diminuirFonte: () => setIndiceFonte((atual) => Math.max(atual - 1, 0)),
    }),
    [altoContraste, indiceFonte],
  )

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext)

  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de um AccessibilityProvider.')
  }

  return context
}
