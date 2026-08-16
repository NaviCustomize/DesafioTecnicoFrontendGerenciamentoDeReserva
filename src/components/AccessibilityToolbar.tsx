import { ICONS } from './Icons'
import { useAccessibility } from '../context/AccessibilityContext'
import { ToolbarWrapper, ToolbarButton, FontButton } from './AccessibilityToolbar.styles'

const { MdContrast } = ICONS

export function AccessibilityToolbar() {
  const { altoContraste, alternarContraste, podeAumentarFonte, podeDiminuirFonte, aumentarFonte, diminuirFonte } =
    useAccessibility()

  return (
    <ToolbarWrapper role="group" aria-label="Preferências de acessibilidade">
      <ToolbarButton
        type="button"
        $altoContraste={altoContraste}
        onClick={alternarContraste}
        aria-pressed={altoContraste}
        aria-label={altoContraste ? 'Desativar alto contraste' : 'Ativar alto contraste'}
      >
        <MdContrast aria-hidden="true" />
      </ToolbarButton>

      <FontButton
        type="button"
        $altoContraste={altoContraste}
        onClick={aumentarFonte}
        disabled={!podeAumentarFonte}
        aria-label="Aumentar tamanho da fonte"
      >
        A+
      </FontButton>

      <FontButton
        type="button"
        $altoContraste={altoContraste}
        onClick={diminuirFonte}
        disabled={!podeDiminuirFonte}
        aria-label="Diminuir tamanho da fonte"
      >
        A-
      </FontButton>
    </ToolbarWrapper>
  )
}
