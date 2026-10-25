# Instruções do projeto

## Documentação no Notion

Este projeto é documentado na base de conhecimento da JMAKE no Notion.
Mantenha o registro atualizado sem que eu precise pedir.

**Quando atualizar:** ao final de uma sessão em que houve mudança relevante
(feature nova, decisão tomada, mudança de arquitetura ou stack, deploy, mudança de status).
Não atualize por ajustes triviais (typo, formatação).

**Onde:**
- Database "Projetos": collection://e1407949-fffb-46af-bd78-50ac0e3c5c9d
- Página "Workflow": 404c7e9cee0e81baaa01edbd60252bcf

**Como:**
1. Busque o registro deste projeto no database pelo nome e ATUALIZE. Nunca crie duplicado.
2. Atualize só o que mudou: propriedades (Status, Stack, Clientes, Link…) e as seções
   Visão geral · Arquitetura · Decisões tomadas (com o porquê) · Como rodar / deployar · Próximos passos · Links.
   Não reescreva o que continua válido.
3. Se surgiu um processo, ferramenta ou convenção que vale para todos os projetos,
   acrescente na seção certa da página Workflow, sem apagar o que outras sessões registraram.
4. Clientes: use o nome exatamente como está no schema; se for novo, adicione a opção antes.

**Regras:** português; só o que está no código ou foi decidido na conversa ("A confirmar" no lugar de suposições);
nada de senhas, tokens, chaves ou .env.

Se o MCP do Notion não estiver disponível, me avise no final da sessão em vez de pular em silêncio.
Na última mensagem, diga em uma linha o que foi atualizado no Notion.

## Padrão de commit

Formato: `tipo: descrição` — descrição em português, curta, começando em minúscula, sem ponto final.

| Tipo | Quando usar |
|---|---|
| `feat` | nova funcionalidade ou conteúdo novo no site |
| `fix` | correção de bug ou de deploy |
| `docs` | só documentação (README, CLAUDE.md) |
| `style` | visual/CSS ou formatação, sem mudar comportamento |
| `refactor` | reorganização de código sem mudar comportamento |
| `chore` | configuração, dependências, assets, arquivos auxiliares |

Exemplos:
- `feat: gerador de orçamento`
- `fix: corrigindo deploy para o vercel`
- `style: ajusta cores do cabeçalho no tema escuro`

Um commit por mudança lógica; não misture tipos no mesmo commit.
