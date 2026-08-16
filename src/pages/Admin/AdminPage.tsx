import { useCallback, useEffect, useMemo, useState } from 'react'
import { Table, Button, Spinner, Alert, Modal, Tabs, Tab, Badge, Form, InputGroup } from 'react-bootstrap'
import { ToastService } from '../../components/Toast'
import { AppLayout } from '../../layout/AppLayout'
import { ICONS, ICON_SIZES } from '../../components/Icons'
import { HotelModal } from './HotelModal'
import { QuartoModal } from './QuartoModal'
import type {
  HotelResponse,
  QuartoResponse,
  ReservaResponse,
  UsuarioAdminResponse,
  NotificacaoResponse,
} from '../../types/api'
import { listarNotificacoes } from '../../services/notificacaoService'
import { listarTodasReservas } from '../../services/reservaService'
import { StatusBadge } from '../../components/StatusBadge'
import { calcularTotal, formatarMoeda, formatarData, formatarHora } from '../../utils/reserva'
import { nomeCompleto } from '../../utils/usuario'
import { listarHoteis, excluirHotel } from '../../services/hotelService'
import { listarQuartos, excluirQuarto } from '../../services/quartoService'
import {
  listarUsuariosParaGestao,
  inativarUsuario,
  reativarUsuario,
} from '../../services/usuarioService'
import { extrairMensagemErro } from '../../services/api'
import { StatusQuartoBadge } from './StatusQuartoBadge'
import { useAuth } from '../../context/AuthContext'

const {
  IoMdAddCircleOutline,
  IoMdCloseCircleOutline,
  MdOutlineEdit,
  AiOutlineUserDelete,
  FiCheckSquare,
  MdOutlineSearch,
  FaWpforms,
} = ICONS

const ID_TOAST_ADMIN = 'erro-carregar-admin'

function classeDoEvento(tipoEvento: string): string {
  if (tipoEvento === 'Cancelada') return 'badge-status-cancelada'
  if (tipoEvento === 'Lembrete') return 'badge-status-pendente'
  if (tipoEvento === 'Atualizada') return 'badge-status-finalizada'

  return 'badge-status-confirmada'
}

function formatarDataHoraCompleta(data: string): string {
  return new Date(data).toLocaleString('pt-BR')
}

function nomeDoHospede(usuarios: UsuarioAdminResponse[], usuarioId: number): string {
  const usuario = usuarios.find((u) => u.id === usuarioId)

  return usuario ? nomeCompleto(usuario) : `Usuário #${usuarioId}`
}

function reservaAtualDoQuarto(
  reservas: ReservaResponse[],
  quartoId: number,
): ReservaResponse | undefined {
  return reservas
    .filter(
      (r) =>
        r.quartoId === quartoId &&
        (r.status === 'Pendente' || r.status === 'Confirmada'),
    )
    .sort((a, b) => a.dataCheckIn.localeCompare(b.dataCheckIn))[0]
}

type Exclusao =
  | { tipo: 'hotel'; item: HotelResponse }
  | { tipo: 'quarto'; item: QuartoResponse }
  | { tipo: 'usuario'; item: UsuarioAdminResponse }

export function AdminPage() {
  const { usuario: usuarioLogado } = useAuth()

  const [hoteis, setHoteis] = useState<HotelResponse[]>([])
  const [quartos, setQuartos] = useState<QuartoResponse[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioAdminResponse[]>([])
  const [reativando, setReativando] = useState<number | null>(null)
  const [reservas, setReservas] = useState<ReservaResponse[]>([])
  const [buscaHospede, setBuscaHospede] = useState('')
  const [notificacoes, setNotificacoes] = useState<NotificacaoResponse[]>([])
  const [carregando, setCarregando] = useState(true)
  const [falhou, setFalhou] = useState(false)

  const [modalHotel, setModalHotel] = useState(false)
  const [hotelEmEdicao, setHotelEmEdicao] = useState<HotelResponse | null>(null)

  const [modalQuarto, setModalQuarto] = useState(false)
  const [quartoEmEdicao, setQuartoEmEdicao] = useState<QuartoResponse | null>(null)

  const [exclusao, setExclusao] = useState<Exclusao | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    setFalhou(false)
    ToastService.dispensar(ID_TOAST_ADMIN)

    try {
      const [hoteisData, quartosData, usuariosData, reservasData, notificacoesData] =
        await Promise.all([
          listarHoteis(),
          listarQuartos(),
          listarUsuariosParaGestao(),
          listarTodasReservas(),
          listarNotificacoes(),
        ])

      setHoteis(hoteisData)
      setQuartos(quartosData)
      setUsuarios(usuariosData)
      setReservas(reservasData)
      setNotificacoes(notificacoesData)
    } catch (error) {
      setFalhou(true)
      ToastService.errorPersistente(extrairMensagemErro(error), ID_TOAST_ADMIN)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  function nomeDoHotel(hotelId: number): string {
    return hoteis.find((h) => h.id === hotelId)?.nome ?? `Hotel #${hotelId}`
  }

  function descreverExclusao(alvo: Exclusao): string {
    if (alvo.tipo === 'hotel') return `o hotel ${alvo.item.nome}`
    if (alvo.tipo === 'usuario') return `o usuário ${alvo.item.nome}`

    return `o quarto ${alvo.item.numero} de ${nomeDoHotel(alvo.item.hotelId)}`
  }

  async function reativar(item: UsuarioAdminResponse) {
    setReativando(item.id)

    try {
      await reativarUsuario(item.id)
      ToastService.success(`${item.nome} voltou a ter acesso.`)
      await carregarDados()
    } catch (error) {
      ToastService.error(extrairMensagemErro(error))
    } finally {
      setReativando(null)
    }
  }

  async function confirmarExclusao() {
    if (!exclusao) return

    setExcluindo(true)

    try {
      if (exclusao.tipo === 'hotel') {
        await excluirHotel(exclusao.item.id)
        ToastService.success('Hotel excluído.')
      } else if (exclusao.tipo === 'usuario') {
        await inativarUsuario(exclusao.item.id)
        ToastService.success('Usuário inativado.')
      } else {
        await excluirQuarto(exclusao.item.id)
        ToastService.success('Quarto excluído.')
      }

      setExclusao(null)
      await carregarDados()
      document.getElementById('conteudo-principal')?.focus()
    } catch (error) {
      ToastService.error(extrairMensagemErro(error))
    } finally {
      setExcluindo(false)
    }
  }

  const ehUsuario = exclusao?.tipo === 'usuario'

  const reservasFiltradas = useMemo(() => {
    const termo = buscaHospede.trim().toLowerCase()

    const ordenadas = [...reservas].sort((a, b) =>
      b.dataCheckIn.localeCompare(a.dataCheckIn),
    )

    if (!termo) return ordenadas

    const idsQueBatem = new Set(
      usuarios
        .filter(
          (u) =>
            nomeCompleto(u).toLowerCase().includes(termo) ||
            u.email.toLowerCase().includes(termo),
        )
        .map((u) => u.id),
    )

    return ordenadas.filter((r) => idsQueBatem.has(r.usuarioId))
  }, [reservas, usuarios, buscaHospede])

  return (
    <AppLayout
      titulo="Administração"
      icone={<FaWpforms size={ICON_SIZES.header} aria-hidden="true" />}
    >
      {carregando && (
        <div className="text-center py-5" role="status" aria-live="polite">
          <Spinner animation="border" style={{ color: 'var(--verde-escuro)' }} aria-hidden="true" />
          <span className="visually-hidden">Carregando cadastros...</span>
        </div>
      )}

      {!carregando && falhou && (
        <div className="text-center py-5">
          <p className="mb-3">Não foi possível carregar os cadastros.</p>
          <Button variant="outline-success" onClick={carregarDados}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!carregando && !falhou && (
        <Tabs defaultActiveKey="hoteis" className="mb-4">
          <Tab eventKey="hoteis" title={`Hotéis (${hoteis.length})`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="mb-0" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Hotéis cadastrados
              </h2>
              <Button
                variant="success"
                onClick={() => {
                  setHotelEmEdicao(null)
                  setModalHotel(true)
                }}
              >
                <IoMdAddCircleOutline className="me-1" aria-hidden="true" />
                Novo Hotel
              </Button>
            </div>

            {hoteis.length === 0 ? (
              <Alert variant="info">Nenhum hotel cadastrado ainda.</Alert>
            ) : (
              <section tabIndex={0} aria-label="Hotéis cadastrados" className="table-responsive">
                <Table hover className="bg-white rounded shadow-sm overflow-hidden mb-0">
                  <caption className="visually-hidden">
                    Hotéis cadastrados, com localização, descrição e ações de edição e exclusão.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Nome</th>
                      <th scope="col">Localização</th>
                      <th scope="col">Descrição</th>
                      <th scope="col">Quartos</th>
                      <th scope="col" className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hoteis.map((hotel) => (
                      <tr key={hotel.id}>
                        <td>{hotel.nome}</td>
                        <td>{hotel.localizacao}</td>
                        <td>{hotel.descricao ?? '—'}</td>
                        <td>{quartos.filter((q) => q.hotelId === hotel.id).length}</td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end flex-wrap">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => {
                                setHotelEmEdicao(hotel)
                                setModalHotel(true)
                              }}
                              aria-label={`Editar hotel ${hotel.nome}`}
                            >
                              <MdOutlineEdit className="me-1" aria-hidden="true" />
                              Editar
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => setExclusao({ tipo: 'hotel', item: hotel })}
                              aria-label={`Excluir hotel ${hotel.nome}`}
                            >
                              <IoMdCloseCircleOutline className="me-1" aria-hidden="true" />
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </section>
            )}
          </Tab>

          <Tab eventKey="quartos" title={`Quartos (${quartos.length})`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="mb-0" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Quartos cadastrados
              </h2>
              <Button
                variant="success"
                disabled={hoteis.length === 0}
                onClick={() => {
                  setQuartoEmEdicao(null)
                  setModalQuarto(true)
                }}
              >
                <IoMdAddCircleOutline className="me-1" aria-hidden="true" />
                Novo Quarto
              </Button>
            </div>

            {hoteis.length === 0 && (
              <Alert variant="warning">Cadastre um hotel antes de cadastrar quartos.</Alert>
            )}

            {hoteis.length > 0 && quartos.length === 0 ? (
              <Alert variant="info">Nenhum quarto cadastrado ainda.</Alert>
            ) : (
              quartos.length > 0 && (
                <section tabIndex={0} aria-label="Quartos cadastrados" className="table-responsive">
                  <Table hover className="bg-white rounded shadow-sm overflow-hidden mb-0">
                    <caption className="visually-hidden">
                      Quartos cadastrados, com hotel, tipo, preço, situação e ações.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Hotel</th>
                        <th scope="col">Número</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Preço/noite</th>
                        <th scope="col">Situação</th>
                        <th scope="col">Reservado por</th>
                        <th scope="col" className="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quartos.map((quarto) => (
                        <tr key={quarto.id}>
                          <td>{nomeDoHotel(quarto.hotelId)}</td>
                          <td>{quarto.numero}</td>
                          <td>{quarto.tipo}</td>
                          <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                            R$ {quarto.precoPorNoite.toFixed(2)}
                          </td>
                          <td>
                            <StatusQuartoBadge status={quarto.status} />
                          </td>
                          <td>
                            {(() => {
                              const reserva = reservaAtualDoQuarto(reservas, quarto.id)

                              if (!reserva) {
                                return <span className="text-muted">—</span>
                              }

                              return (
                                <>
                                  {nomeDoHospede(usuarios, reserva.usuarioId)}
                                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    {formatarData(reserva.dataCheckIn)} a{' '}
                                    {formatarData(reserva.dataCheckOut)}
                                  </div>
                                </>
                              )
                            })()}
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-2 justify-content-end flex-wrap">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => {
                                  setQuartoEmEdicao(quarto)
                                  setModalQuarto(true)
                                }}
                                aria-label={`Editar quarto ${quarto.numero} de ${nomeDoHotel(quarto.hotelId)}`}
                              >
                                <MdOutlineEdit className="me-1" aria-hidden="true" />
                                Editar
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => setExclusao({ tipo: 'quarto', item: quarto })}
                                aria-label={`Excluir quarto ${quarto.numero} de ${nomeDoHotel(quarto.hotelId)}`}
                              >
                                <IoMdCloseCircleOutline className="me-1" aria-hidden="true" />
                                Excluir
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </section>
              )
            )}
          </Tab>
          <Tab eventKey="reservas" title={`Reservas (${reservas.length})`}>
            <h2 className="mb-1" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Todas as reservas
            </h2>
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              Reservas de todos os hóspedes, das mais recentes para as mais antigas.
            </p>

            <Form.Group className="mb-2" controlId="busca-hospede" style={{ maxWidth: '28rem' }}>
              <Form.Label>Procurar hóspede</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <MdOutlineSearch aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  placeholder="Nome, sobrenome ou e-mail"
                  value={buscaHospede}
                  onChange={(e) => setBuscaHospede(e.target.value)}
                  aria-describedby="resultado-busca"
                />
                {buscaHospede && (
                  <Button variant="outline-secondary" onClick={() => setBuscaHospede('')}>
                    Limpar
                  </Button>
                )}
              </InputGroup>
            </Form.Group>

            <p id="resultado-busca" className="text-muted mb-3" aria-live="polite" style={{ fontSize: '0.9rem' }}>
              {buscaHospede
                ? `${reservasFiltradas.length} ${reservasFiltradas.length === 1 ? 'reserva encontrada' : 'reservas encontradas'} para "${buscaHospede}".`
                : `${reservas.length} ${reservas.length === 1 ? 'reserva' : 'reservas'} no total.`}
            </p>

            {reservas.length === 0 ? (
              <Alert variant="info">Nenhuma reserva registrada ainda.</Alert>
            ) : reservasFiltradas.length === 0 ? (
              <Alert variant="info">
                Nenhuma reserva de hóspede com <strong>{buscaHospede}</strong>.
              </Alert>
            ) : (
              <section tabIndex={0} aria-label="Todas as reservas" className="table-responsive">
                <Table hover className="bg-white rounded shadow-sm overflow-hidden mb-0">
                  <caption className="visually-hidden">
                    Reservas de todos os hóspedes, com quarto, período, valor e situação.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Hóspede</th>
                      <th scope="col">Hotel / Quarto</th>
                      <th scope="col">Check-in</th>
                      <th scope="col">Check-out</th>
                      <th scope="col" className="text-end">Valor</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasFiltradas
                      .map((reserva) => {
                        const quarto = quartos.find((q) => q.id === reserva.quartoId)
                        const valor = calcularTotal(
                          quarto,
                          reserva.dataCheckIn,
                          reserva.dataCheckOut,
                        )

                        return (
                          <tr key={reserva.id}>
                            <td>{nomeDoHospede(usuarios, reserva.usuarioId)}</td>
                            <td>
                              {quarto
                                ? `${nomeDoHotel(quarto.hotelId)} — Quarto ${quarto.numero}`
                                : `Quarto #${reserva.quartoId}`}
                            </td>
                            <td>
                              {formatarData(reserva.dataCheckIn)}
                              {formatarHora(reserva.dataCheckIn) && (
                                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                  {formatarHora(reserva.dataCheckIn)}
                                </div>
                              )}
                            </td>
                            <td>
                              {formatarData(reserva.dataCheckOut)}
                              {formatarHora(reserva.dataCheckOut) && (
                                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                  {formatarHora(reserva.dataCheckOut)}
                                </div>
                              )}
                            </td>
                            <td
                              className="text-end"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {valor !== null ? formatarMoeda(valor) : '—'}
                            </td>
                            <td>
                              <StatusBadge status={reserva.status} />
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </Table>
              </section>
            )}
          </Tab>

          <Tab eventKey="notificacoes" title={`Notificações (${notificacoes.length})`}>
            <h2 className="mb-1" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Notificações processadas
            </h2>
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              Eventos publicados na fila do RabbitMQ a cada mudança de reserva e já consumidos
              em segundo plano. Aparecem aqui logo depois da ação, sem recarregar a reserva.
            </p>

            {notificacoes.length === 0 ? (
              <Alert variant="info">
                Nenhuma notificação processada ainda. Crie ou cancele uma reserva para gerar
                a primeira.
              </Alert>
            ) : (
              <section
                tabIndex={0}
                aria-label="Notificações processadas"
                className="table-responsive"
              >
                <Table hover className="bg-white rounded shadow-sm overflow-hidden mb-0">
                  <caption className="visually-hidden">
                    Eventos de reserva consumidos da fila, com tipo, hóspede, quarto e quando
                    foram processados.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Evento</th>
                      <th scope="col">Hóspede</th>
                      <th scope="col">Hotel / Quarto</th>
                      <th scope="col">Check-in</th>
                      <th scope="col">Processado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notificacoes.map((n) => (
                      <tr key={n.id}>
                        <td>
                          <Badge className={classeDoEvento(n.tipoEvento)}>{n.tipoEvento}</Badge>
                        </td>
                        <td>
                          {n.hospede || `Usuário #${n.reservaId}`}
                          {n.hospedeEmail && (
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                              {n.hospedeEmail}
                            </div>
                          )}
                        </td>
                        <td>
                          {n.hotel || '—'}
                          {n.quartoNumero > 0 && (
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                              Quarto {n.quartoNumero}
                            </div>
                          )}
                        </td>
                        <td>{formatarData(n.dataCheckIn)}</td>
                        <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatarDataHoraCompleta(n.processadoEm)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </section>
            )}
          </Tab>

          <Tab eventKey="usuarios" title={`Usuários (${usuarios.length})`}>
            <h2 className="mb-1" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Usuários cadastrados
            </h2>
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              Contas inativas continuam listadas e podem ser reativadas. Os dados pessoais são
              editados pelo próprio usuário, no perfil dele.
            </p>

            <section tabIndex={0} aria-label="Usuários cadastrados" className="table-responsive">
              <Table hover className="bg-white rounded shadow-sm overflow-hidden mb-0">
                <caption className="visually-hidden">
                  Usuários do sistema, com e-mail, papel e ação de ativar ou inativar. O rótulo
                  do botão indica a situação da conta.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Papel</th>
                    <th scope="col" className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((item) => {
                    const ehVoce = item.id === usuarioLogado?.id

                    return (
                      <tr key={item.id} style={{ opacity: item.ativo ? 1 : 0.65 }}>
                        <td>
                          {nomeCompleto(item)}
                          {ehVoce && (
                            <span className="text-muted ms-2" style={{ fontSize: '0.85rem' }}>
                              (você)
                            </span>
                          )}
                        </td>
                        <td style={{ wordBreak: 'break-word' }}>{item.email}</td>
                        <td>
                          <Badge
                            className={
                              item.role === 'Admin'
                                ? 'badge-status-confirmada'
                                : 'badge-status-finalizada'
                            }
                          >
                            {item.role === 'Admin' ? 'Administrador' : 'Usuário'}
                          </Badge>
                        </td>
                        <td className="text-end">
                          {item.ativo ? (
                            <Button
                              variant="outline-danger"
                              size="sm"

                              disabled={ehVoce}
                              onClick={() => setExclusao({ tipo: 'usuario', item })}
                              aria-label={`Inativar usuário ${item.nome}`}
                            >
                              <AiOutlineUserDelete className="me-1" aria-hidden="true" />
                              Inativar
                            </Button>
                          ) : (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => reativar(item)}
                              disabled={reativando === item.id}
                              aria-busy={reativando === item.id}
                              aria-label={`Ativar usuário ${item.nome}`}
                            >
                              {reativando === item.id ? (
                                <Spinner
                                  animation="border"
                                  size="sm"
                                  className="me-1"
                                  aria-hidden="true"
                                />
                              ) : (
                                <FiCheckSquare className="me-1" aria-hidden="true" />
                              )}
                              Ativar
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </section>
          </Tab>
        </Tabs>
      )}

      <HotelModal
        show={modalHotel}
        hotelEmEdicao={hotelEmEdicao}
        onClose={() => {
          setModalHotel(false)
          setHotelEmEdicao(null)
        }}
        onSalvo={carregarDados}
      />

      <QuartoModal
        show={modalQuarto}
        hoteis={hoteis}
        quartoEmEdicao={quartoEmEdicao}
        onClose={() => {
          setModalQuarto(false)
          setQuartoEmEdicao(null)
        }}
        onSalvo={carregarDados}
      />

      <Modal
        show={exclusao !== null}
        onHide={() => setExclusao(null)}
        centered
        aria-labelledby="titulo-confirmar-exclusao"
      >
        <Modal.Header closeButton closeLabel="Fechar">
          <Modal.Title as="h2" id="titulo-confirmar-exclusao" style={{ fontSize: '1.25rem' }}>
            {ehUsuario ? 'Confirmar inativação' : 'Confirmar exclusão'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {exclusao && (
            <>
              <p className="mb-2">
                Tem certeza que deseja {ehUsuario ? 'inativar' : 'excluir'}{' '}
                <strong>{descreverExclusao(exclusao)}</strong>?
              </p>
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                {ehUsuario
                  ? 'A pessoa perde o acesso ao sistema, mas as reservas dela continuam no histórico.'
                  : 'O registro sai das listagens, mas as reservas já feitas continuam no histórico.'}
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setExclusao(null)} autoFocus>
            Manter
          </Button>
          <Button variant="danger" onClick={confirmarExclusao} disabled={excluindo} aria-busy={excluindo}>
            {excluindo && <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />}
            {ehUsuario ? 'Inativar' : 'Excluir'}
          </Button>
        </Modal.Footer>
      </Modal>
    </AppLayout>
  )
}
