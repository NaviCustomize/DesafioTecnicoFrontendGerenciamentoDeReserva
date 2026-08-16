import { Badge } from 'react-bootstrap'
import type { StatusQuarto } from '../../types/api'

const classePorStatus: Record<StatusQuarto, string> = {
  Disponivel: 'badge-status-confirmada',
  Reservado: 'badge-status-pendente',
}

const rotuloPorStatus: Record<StatusQuarto, string> = {
  Disponivel: 'Disponível',
  Reservado: 'Reservado',
}

export function StatusQuartoBadge({ status }: { status: StatusQuarto }) {
  return <Badge className={classePorStatus[status]}>{rotuloPorStatus[status]}</Badge>
}
