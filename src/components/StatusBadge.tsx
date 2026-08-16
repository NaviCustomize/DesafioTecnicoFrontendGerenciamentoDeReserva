import { Badge } from 'react-bootstrap'
import type { StatusReserva } from '../types/api'

const classePorStatus: Record<StatusReserva, string> = {
  Pendente: 'badge-status-pendente',
  Confirmada: 'badge-status-confirmada',
  Cancelada: 'badge-status-cancelada',
  Finalizada: 'badge-status-finalizada',
}

const rotuloPorStatus: Record<StatusReserva, string> = {
  Pendente: 'Pendente',
  Confirmada: 'Confirmada',
  Cancelada: 'Cancelada',
  Finalizada: 'Finalizada',
}

export function StatusBadge({ status }: { status: StatusReserva }) {
  return <Badge className={classePorStatus[status]}>{rotuloPorStatus[status]}</Badge>
}
