# AILegal
 
SaaS de mineração de processos jurídicos que transforma documentos de escritórios de advocacia em fluxogramas BPMN interativos, usando IA generativa, e adiciona uma camada completa de gestão operacional por cima: diário de bordo, monitoramento de produtividade e um painel de gestor com insights automáticos.
 
Construído como projeto de estágio em Ciência da Computação no IFG Campus Morrinhos, atualmente em produção e uso real por um escritório de advocacia parceiro.
 
## O que o sistema faz
 
**Mapeamento de processos com IA** — o usuário importa um ou mais documentos (RCC) e o Google Gemini analisa o conteúdo, identifica atores, decisões e sequências, e gera automaticamente um fluxograma BPMN completo com raias por responsável. Múltiplos arquivos podem ser processados como fluxos separados ou mesclados incrementalmente na mesma tela, com a IA decidindo se os processos têm relação entre si.
 
**Diário de bordo operacional** — cada nó do fluxograma pode virar uma microtarefa do dia, atribuída automaticamente ao colaborador certo. A navegação por mês, semana e dia mostra todas as tarefas da equipe, com histórico de auditoria completo (quem alterou o quê, quando, e em nome de quem) e um painel de IA que analisa a carga de trabalho e sugere realocações.
 
**Monitoramento de produtividade** — uma extensão de navegador (Manifest V3) mede o tempo que cada colaborador passa em ferramentas operacionais como WhatsApp Web, Gmail e redes sociais, com atualização em tempo real via Server-Sent Events.
 
**Painel do gestor** — cruza dados de processos, tarefas e monitoramento em um único dashboard com funil de conclusão, desempenho por colaborador, correlação entre produtividade e horas ativas, e insights gerados por IA.
 
**Modo de apresentação** — fullscreen e walkthrough guiado nó a nó, para apresentar o fluxograma a clientes sem expor a interface de edição.
 
## Stack técnica
 
**Frontend** — React + Vite, React Flow para o canvas BPMN, Dagre.js para auto-layout, Recharts para os dashboards.
 
**Backend** — Node.js + TypeScript, Express, arquitetura modular em monorepo (Turborepo).
 
**IA** — Google Gemini, com prompt engineering para modelagem BPMN e merge incremental de grafos.
 
**Banco de dados** — PostgreSQL com colunas JSONB para os grafos do React Flow e tabelas relacionais para tarefas, auditoria e monitoramento.
 
**Autenticação** — JWT + bcrypt, com sistema de "atuar como" outro colaborador mediante verificação de senha, registrado em log de auditoria.
 
**Extensão de navegador** — Chrome Manifest V3 com Service Worker, `chrome.alarms` e `chrome.storage`.
 
**Deploy** — Docker, Dokploy self-hosted em VPS, CI/CD automático a cada push.
 
## Estrutura do monorepo
 
```
ailegal-saas/
├── apps/
│   ├── backend/          API Node.js/Express/TypeScript
│   ├── frontend/         React + Vite
│   └── extension/        Extensão Chrome (Manifest V3)
└── packages/
    └── shared-types/     Tipos TypeScript compartilhados
```
 
## Principais decisões de arquitetura
 
**PostgreSQL com JSONB em vez de Neo4j** — o fluxograma BPMN é estruturalmente um grafo, mas o histórico de auditoria precisa de consultas cronológicas relacionais. Um banco de grafos dedicado seria mais caro e mais lento para esse segundo caso, então o grafo do React Flow é salvo direto como JSONB e o restante em tabelas relacionais normais.
 
**Server-Sent Events para tempo real** — escolhido sobre WebSocket (mais complexo, bidirecional sem necessidade) e polling (requisições desnecessárias). Como o `EventSource` do navegador não suporta headers de Authorization, o token JWT é passado via query param e validado no servidor antes de abrir o stream.
 
**Extensão de navegador para monitoramento** — uma aplicação web só enxerga o que acontece dentro da própria aba. Para medir tempo em outras abas (WhatsApp, Gmail), foi necessário sair da camada web e construir uma extensão com acesso a `chrome.tabs`. O Service Worker do Manifest V3 é efêmero (desliga após 30s de inatividade), então o estado do cronômetro é persistido em `chrome.storage`, não em variáveis de memória.
 
**Merge incremental de grafos via IA** — ao processar múltiplos documentos na mesma aba, cada novo arquivo é enviado à IA junto com o grafo já existente. A IA decide se cria conexões entre os processos (dependência real) ou os deixa como fluxos paralelos independentes — com uma camada de validação que restaura nós que a IA eventualmente remova por engano.
 
## Status
 
Em desenvolvimento ativo. Já em produção com uso real por um escritório de advocacia parceiro.
