export function nomeCompleto(pessoa: { nome: string; sobrenome?: string }): string {
  const sobrenome = pessoa.sobrenome?.trim()

  return sobrenome ? `${pessoa.nome} ${sobrenome}` : pessoa.nome
}
