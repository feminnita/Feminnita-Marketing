# Feminnita Marketing Strategy — Documentação Técnica Completa

> **Projeto:** Plataforma de Estratégia de Marketing Digital para Feminnita Pijamas (Atacado)
> **URL de Produção:** https://feminnita-5s7usnyn.manus.space
> **Versão Atual:** b62e216 (main)
> **Total de Commits:** 157
> **Total de Arquivos TypeScript/TSX:** 396
> **Banco de Dados:** MySQL/TiDB (25 tabelas)
> **Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + Drizzle ORM

---

## 1. Visão Geral do Projeto

A **Feminnita Marketing Strategy** é uma plataforma web completa de automação de marketing digital desenvolvida especificamente para a Feminnita, empresa de atacado de pijamas. O sistema centraliza em um único painel todas as ferramentas necessárias para gerenciar influenciadoras virtuais, automatizar postagens em redes sociais, atender clientes via WhatsApp com IA, monitorar campanhas de anúncios e sincronizar dados com o ERP Bling.

O projeto foi construído com uma arquitetura moderna orientada a contratos (tRPC), garantindo tipagem end-to-end entre frontend e backend, e conta com mais de 45 módulos funcionais organizados em um dashboard lateral com navegação intuitiva.

---

## 2. Arquitetura do Sistema

### 2.1 Stack Tecnológico

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React | 19 |
| Estilização | Tailwind CSS | 4 |
| Componentes UI | shadcn/ui + Radix UI | Latest |
| Backend | Express | 4 |
| API Layer | tRPC | 11 |
| ORM | Drizzle ORM | 0.44.5 |
| Banco de Dados | MySQL / TiDB | Cloud |
| Linguagem | TypeScript | 5.9.3 |
| Build Tool | Vite | Latest |
| Testes | Vitest | Latest |
| WebSocket | Socket.IO | Latest |
| WhatsApp API | Baileys (@whiskeysockets) | Latest |
| Storage | AWS S3 | SDK v3 |
| LLM | Manus Built-in Forge API | Latest |

### 2.2 Estrutura de Diretórios

```
feminnita_marketing_strategy/
├── client/
│   ├── src/
│   │   ├── _core/hooks/        ← Hooks de autenticação e WebSocket
│   │   ├── components/         ← 100+ componentes de seções
│   │   ├── pages/              ← 45 páginas principais
│   │   ├── lib/trpc.ts         ← Cliente tRPC
│   │   └── App.tsx             ← Roteamento principal
├── server/
│   ├── _core/                  ← Infraestrutura (auth, LLM, Baileys, WebSocket)
│   ├── routers/                ← 60+ routers tRPC com lógica de negócio
│   ├── db.ts                   ← Helpers de banco de dados
│   ├── routers.ts              ← AppRouter principal
│   └── storage.ts              ← Helpers de S3
├── drizzle/
│   └── schema.ts               ← 25 tabelas de banco de dados
└── shared/                     ← Tipos e constantes compartilhados
```

---

## 3. Módulos e Funcionalidades

### 3.1 Sistema de Influenciadoras Virtuais

O núcleo do sistema são as **4 influenciadoras virtuais autônomas** criadas para representar a marca Feminnita em diferentes plataformas:

| Influenciadora | Perfil | Plataformas |
|---|---|---|
| **Carol** | Jovem, descontraída, foco em TikTok | TikTok, Instagram, Blog |
| **Renata** | Mãe moderna, foco em família | Instagram, Facebook, Blog |
| **Vanessa** | Lifestyle premium, foco em conteúdo visual | Instagram, YouTube, Blog |
| **Luiza** | Empreendedora, foco em negócios B2B | LinkedIn, Instagram, Blog |

Cada influenciadora possui uma **base de conhecimento individual** armazenada no banco de dados, um **cérebro de IA independente** alimentado pelo LLM integrado, e um **perfil de persona** com tom de voz, temas preferidos e estilo de conteúdo.

### 3.2 Dashboard de Aprovação de Posts

Antes de qualquer publicação, todos os posts gerados pela IA passam por um **fluxo obrigatório de aprovação** pelo proprietário. O sistema inclui:

- Fila de posts pendentes com visualização completa de caption, hashtags e imagem
- Botões de **Aprovar**, **Rejeitar** (com motivo) e **Editar** antes de publicar
- Histórico completo de posts publicados e rejeitados
- Estatísticas de aprovação por influenciadora
- Notificação automática ao proprietário quando novos posts chegam para revisão

### 3.3 Geração Automática de Conteúdo com IA

O módulo de geração de conteúdo utiliza o LLM integrado para criar:

- **Roteiros de vídeos** para Stories, Reels e TikTok
- **Legendas otimizadas** com hashtags relevantes
- **Ideias de imagens** para Instagram
- **Posts de blog** completos para cada influenciadora
- **Roteiros de anúncios** (Meta Ads, TikTok Ads)
- **Planejamento semanal** de conteúdo por persona

O conteúdo é gerado com base em tendências virais monitoradas em tempo real, no perfil de cada influenciadora e no catálogo de produtos da Feminnita.

### 3.4 Sistema de IA de Atendimento no WhatsApp

O sistema de atendimento automático via WhatsApp utiliza **Baileys** (API gratuita sem custos da Meta) e inclui:

**Componentes do Sistema:**

| Componente | Descrição |
|---|---|
| **Baileys Service** | Conexão direta com WhatsApp Web via QR Code |
| **IA de Atendimento** | LLM treinado para responder dúvidas de clientes |
| **Base de Conhecimento** | Produtos, FAQs, políticas, promoções |
| **Sistema de FAQs** | 6 categorias padrão (Tamanho, Preço, Entrega, etc.) |
| **Escalação para Humano** | Detecção automática de palavras-chave |
| **WebSocket** | Notificações em tempo real via Socket.IO |

**Fluxo de Atendimento:**

1. Cliente envia mensagem no WhatsApp
2. Baileys recebe e encaminha para o servidor
3. IA busca contexto na base de conhecimento
4. LLM gera resposta personalizada
5. Se detectar pedido de humano, escala automaticamente
6. Proprietário recebe notificação em tempo real

### 3.5 Dashboard de Treinamento da IA

O ambiente de treinamento permite ao proprietário:

- **Adicionar exemplos de conversas** com categorias (saudação, produto, entrega, etc.)
- **Gerenciar base de conhecimento** com produtos, FAQs e políticas
- **Configurar parâmetros** da IA (temperatura, tokens, prompt do sistema)
- **Testar respostas** antes de ativar em produção
- **Visualizar estatísticas** de treinamento e taxa de escalação

### 3.6 Integração com Redes Sociais

O sistema suporta publicação automática nas principais plataformas:

| Plataforma | Funcionalidades |
|---|---|
| **Instagram** | Publicar posts, Reels, Stories; métricas de engajamento |
| **TikTok** | Publicar vídeos; análise de tendências virais |
| **YouTube** | Publicar vídeos; gerenciar canal |
| **Facebook** | Publicar posts; campanhas de anúncios |
| **Meta Ads** | Criar campanhas, otimizar orçamento, relatórios de ROI |
| **TikTok Ads** | Criar e gerenciar campanhas |
| **Google Ads** | Integração com campanhas de busca |

### 3.7 Integração com Bling ERP

A sincronização com o **Bling ERP** é bidirecional e em tempo real:

- Sincronização automática de **produtos** (nome, preço, estoque, fotos)
- Sincronização de **pedidos** com status atualizado
- **Webhooks** para notificações instantâneas de mudanças
- **Pausa automática** de campanhas quando produto esgota
- Dashboard de **status de sincronização** com logs de erros

### 3.8 Meta Conversions API (CAPI)

Rastreamento avançado de eventos de conversão:

- Envio de eventos de **compra**, **visualização** e **adição ao carrinho**
- Hash SHA-256 obrigatório para dados de usuário (conformidade LGPD/GDPR)
- Envio em **lote** para otimizar performance
- **Teste de conexão** com Pixel ID e Access Token
- Integração automática com pedidos do Bling

### 3.9 Agendamento e Automação de Postagens

O sistema de agendamento opera automaticamente:

- Postagens programadas para **terças e sextas-feiras**
- **Lembrete na véspera** para aprovação de tema/modelo
- Fluxo de **aprovação obrigatória** antes de publicar
- **Notificações de sucesso/erro** após cada publicação
- Calendário de conteúdo com visualização semanal/mensal

### 3.10 Relatório de Performance por Influenciadora

Dashboard analítico com:

- **Taxa de aprovação** de posts por influenciadora
- **Motivos de rejeição** mais frequentes
- **Histórico mensal** de conteúdo gerado vs. publicado
- **Sugestões de melhoria** baseadas em padrões de feedback
- Comparativo de engajamento entre influenciadoras

---

## 4. Banco de Dados

O sistema utiliza **25 tabelas** organizadas por domínio:

### 4.1 Tabelas Principais

| Tabela | Descrição |
|---|---|
| `users` | Usuários autenticados via Manus OAuth |
| `collaborators` | Colaboradores internos com hash de senha |
| `integrations` | Configurações de integrações externas |
| `oauth_tokens` | Tokens OAuth de plataformas externas |
| `oauth_credentials` | Credenciais de APIs (Meta, Google, Bling, etc.) |

### 4.2 Tabelas de Influenciadoras

| Tabela | Descrição |
|---|---|
| `influencers` | Perfis das 4 influenciadoras virtuais |
| `influencer_knowledge_base` | Base de conhecimento por influenciadora |
| `influencer_posts` | Posts gerados (draft, aprovado, publicado) |
| `influencer_trends` | Tendências monitoradas |
| `influencer_performance` | Métricas de engajamento |
| `influencer_interactions` | Histórico de interações com seguidores |
| `influencer_accounts` | Contas reais de redes sociais por influenciadora |

### 4.3 Tabelas de Conteúdo

| Tabela | Descrição |
|---|---|
| `content_items` | Itens de conteúdo (texto, vídeo, imagem) |
| `media_files` | Arquivos de mídia com referência S3 |
| `scheduled_posts` | Posts agendados com data/hora |
| `post_history` | Histórico de publicações com status |

### 4.4 Tabelas de IA de Atendimento

| Tabela | Descrição |
|---|---|
| `knowledge_base` | Base de conhecimento para IA de atendimento |
| `ai_training_data` | Exemplos de treinamento da IA |
| `conversation_history` | Histórico completo de conversas |
| `escalation_queue` | Fila de escalação para atendimento humano |
| `ai_settings` | Configurações de IA por usuário |

### 4.5 Tabelas de Campanhas e Analytics

| Tabela | Descrição |
|---|---|
| `instagram_accounts` | Contas Instagram conectadas |
| `ig_post_publications` | Histórico de publicações no Instagram |
| `meta_sync_history` | Histórico de sincronização com Meta |
| `meta_campaign_alerts` | Alertas de campanhas Meta Ads |

---

## 5. Routers tRPC

O sistema conta com **60+ routers tRPC** organizados por domínio:

### 5.1 Routers de Influenciadoras

| Router | Procedures Principais |
|---|---|
| `autonomous-influencers` | generateContent, publishPost, monitorTrends |
| `ai-content-generator` | generateCaption, generateScript, generateBlogPost |
| `auto-content-generator` | scheduleGeneration, generateBatch |
| `post-approval` | listPendingPosts, approvePost, rejectPost, editPost |
| `post-approval-enhanced` | generateAndQueue, getApprovalStats, saveFeedback |
| `publication-automation` | schedulePostingDays, sendThemeReminder, approveThemeAndGenerate |
| `influencer-accounts` | saveAccounts, getAccounts, deleteAccount |
| `influencer-blog` | createPost, listPosts, getPost, publishPost |

### 5.2 Routers de WhatsApp e IA

| Router | Procedures Principais |
|---|---|
| `whatsapp-baileys` | initialize, getStatus, getQRCode, sendMessage, disconnect |
| `baileys-ai-integration` | processIncomingMessage, sendAIResponse, escalateToHuman |
| `ai-customer-support` | processMessage, addKnowledgeItem, addTrainingExample, listEscalations |
| `whatsapp-faq` | addFAQ, searchFAQ, listFAQs, importDefaultFAQs |
| `whatsapp-ai-integration` | handleIncomingMessage, sendMessage, sendTemplateMessage |
| `whatsapp-business` | sendMessage, sendMedia, getConversations |

### 5.3 Routers de Redes Sociais

| Router | Procedures Principais |
|---|---|
| `instagram-api` | getBusinessAccount, getMediaList, getMediaInsights, syncPosts |
| `instagram-publisher` | publishPost, publishReel, publishStory |
| `meta-ads` | createCampaign, pauseCampaign, getCampaignMetrics |
| `meta-ads-campaigns` | createFromContent, optimizeCampaign, syncWithContent |
| `meta-capi` | sendEvent, sendBatchEvents, sendPurchaseEvent, testConnection |
| `social-media` | connectAccount, publishToAll, getPublishHistory |

### 5.4 Routers de ERP e Integrações

| Router | Procedures Principais |
|---|---|
| `bling` | syncProducts, syncOrders, getStock |
| `bling-oauth` | initiateOAuth, handleCallback, refreshToken |
| `bling-sync` | syncAll, syncInventory, syncPrices |
| `bling-webhooks` | handleProductUpdate, handleOrderUpdate |
| `melhor-envio` | calculateShipping, trackOrder, generateLabel |
| `canva-integration` | generateDesign, listTemplates, exportDesign |

### 5.5 Routers de Automação e Analytics

| Router | Procedures Principais |
|---|---|
| `automations` | createAutomation, triggerAutomation, listAutomations |
| `campaigns` | createCampaign, updateBudget, getROI |
| `smart-alerts` | createAlert, checkThresholds, listActiveAlerts |
| `post-scheduler` | schedulePost, cancelPost, getScheduledPosts |

---

## 6. Páginas e Navegação

O sistema conta com **45 páginas** acessíveis via sidebar com navegação lateral:

### 6.1 Páginas Principais

| Página | Rota | Descrição |
|---|---|---|
| Home | `/` | Dashboard principal com 100+ seções de estratégia |
| Influencers Dashboard | `/influencers` | Gerenciamento das 4 influenciadoras |
| Aprovar Publicações | `/approval-dashboard` | Fila de aprovação de posts |
| Treinar IA | `/ai-training` | Dashboard de treinamento da IA |
| WhatsApp Baileys | `/whatsapp-baileys` | Conexão e gerenciamento WhatsApp |
| Notificações | `/whatsapp-notifications` | Notificações em tempo real |
| Relatório de Desempenho | `/performance-report` | Analytics por influenciadora |
| Integração Redes Sociais | `/social-media-integration` | Contas das influenciadoras |

### 6.2 Páginas de Integrações

| Página | Rota | Descrição |
|---|---|---|
| Bling Connection | `/bling-connection` | Conectar ERP Bling via OAuth |
| Instagram Dashboard | `/instagram` | Métricas do Instagram |
| Meta Ads Dashboard | `/meta-ads` | Campanhas Meta Ads |
| Meta Ads Campaigns | `/meta-ads-campaigns` | Gerenciar campanhas |
| Meta CAPI Setup | `/meta-capi-setup` | Configurar Conversions API |
| Configurar Credenciais | `/configure-credentials` | Gerenciar tokens de APIs |
| Integration Setup | `/integration-setup` | Testar conexões |
| WhatsApp AI Setup | `/whatsapp-ai-setup` | Configurar IA WhatsApp |

### 6.3 Páginas de Conteúdo

| Página | Rota | Descrição |
|---|---|---|
| Influencer Blog | `/influencer-blog` | Blog das influenciadoras |
| Blogs Externos | `/influencer-blogs` | Links de blogs externos |
| Agendador de Posts | `/schedule-posts` | Agendar publicações |
| Social Media Scheduler | `/social-media-scheduler` | Calendário de conteúdo |
| Automações | `/automations` | Regras de automação |
| Campanhas | `/campaigns` | Gerenciar campanhas |
| Analytics | `/analytics` | Relatórios analíticos |

---

## 7. Segurança e Autenticação

O sistema implementa múltiplas camadas de segurança:

**Autenticação de Usuários:** Manus OAuth 2.0 com JWT assinado, cookies de sessão seguros e middleware de autenticação em todas as procedures protegidas.

**Armazenamento de Credenciais:** Todos os tokens de APIs externas são armazenados criptografados no banco de dados, nunca expostos no frontend. O sistema usa `protectedProcedure` para garantir que apenas usuários autenticados acessem dados sensíveis.

**Conformidade LGPD/GDPR:** Dados de usuários enviados para Meta CAPI são hasheados com SHA-256 antes da transmissão. A política de privacidade está disponível em `/privacidade`.

**Controle de Acesso:** O campo `role` na tabela `users` (admin/user) permite controle granular de acesso a funcionalidades administrativas.

---

## 8. Status do GitHub

O projeto está armazenado em um **repositório Git privado gerenciado pela Manus** (S3-backed Git):

```
Remote: s3://vida-prod-gitrepo/webdev-git/310419663030153148/5s7UsNyNaKsNSzFSrZJVSX
Branch: main
HEAD: b62e216
Total de commits: 157
```

> **Importante:** O repositório atual está no sistema interno da Manus. Para exportar para o **GitHub público/privado**, acesse o painel de gerenciamento do projeto → **Settings → GitHub** e conecte sua conta GitHub para criar um repositório externo.

---

## 9. Dependências Externas Necessárias

Para funcionamento completo em produção, as seguintes credenciais precisam ser configuradas:

| Serviço | Variável de Ambiente | Obrigatório |
|---|---|---|
| Bling ERP | `BLING_CLIENT_ID`, `BLING_CLIENT_SECRET` | Sim |
| Meta Ads | `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` | Sim |
| Meta Pixel | `META_PIXEL_ID`, `META_PAGE_ID` | Sim |
| Melhor Envio | `MELHOR_ENVIO_TOKEN` | Sim |
| WhatsApp Baileys | Conexão via QR Code (sem token) | Sim |
| Instagram Graph API | Token via OAuth (configurar em `/configure-credentials`) | Recomendado |
| Google Ads | Token via OAuth (configurar em `/configure-credentials`) | Opcional |
| Canva API | Token via OAuth (configurar em `/configure-credentials`) | Opcional |

---

## 10. Testes

O projeto mantém uma suíte de testes Vitest cobrindo os principais routers:

| Arquivo de Teste | Testes |
|---|---|
| `ai-content-generator.test.ts` | Geração de conteúdo com IA |
| `ai-customer-support.test.ts` | IA de atendimento ao cliente |
| `auto-content-generator.test.ts` | Geração automática de conteúdo |
| `automations.test.ts` | Regras de automação |
| `campaigns.test.ts` | Gerenciamento de campanhas |
| `collaborators.test.ts` | Cadastro de colaboradores |
| `influencer-accounts.test.ts` | Contas de influenciadoras |
| `influencer-blog.test.ts` | Blog das influenciadoras |
| `instagram-api.test.ts` | Integração Instagram |
| `integrations.test.ts` | Integrações gerais |
| `melhor-envio.test.ts` | Cálculo de frete |
| `meta-ads-campaigns.test.ts` | Campanhas Meta Ads |
| `meta-capi.test.ts` | Meta Conversions API |
| `oauth-callbacks.test.ts` | Callbacks OAuth |
| `oauth-credentials.test.ts` | Credenciais OAuth |
| `oauth-integrations.test.ts` | Integrações OAuth |
| `post-approval.test.ts` | Aprovação de posts |
| `post-approval-enhanced.test.ts` | Aprovação avançada |
| `post-scheduler.test.ts` | Agendamento de posts |
| `publication-automation.test.ts` | Automação de publicação |
| `webhooks.test.ts` | Webhooks do Bling |
| `whatsapp-baileys.test.ts` | API WhatsApp Baileys |
| `whatsapp-business.test.ts` | WhatsApp Business |

Para executar todos os testes:

```bash
pnpm test
```

---

## 11. Como Usar o Sistema

### 11.1 Configuração Inicial

1. Acesse https://feminnita-5s7usnyn.manus.space
2. Faça login com sua conta Manus
3. Vá em **Configurar Credenciais** e adicione os tokens das APIs (Bling, Meta, etc.)
4. Vá em **WhatsApp Baileys** e escaneie o QR Code para conectar seu WhatsApp

### 11.2 Treinar a IA de Atendimento

1. Acesse **Treinar IA** no menu lateral
2. Na aba **Base de Conhecimento**, adicione seus produtos com links
3. Na aba **Treinamento**, adicione exemplos de conversas reais
4. Na aba **Configurações**, ajuste o prompt do sistema e temperatura
5. Na aba **Testar IA**, valide as respostas antes de ativar

### 11.3 Aprovar Posts das Influenciadoras

1. Acesse **Aprovar Publicações** no menu lateral
2. Visualize os posts pendentes gerados pela IA
3. Clique em **Aprovar** para publicar, **Editar** para ajustar ou **Rejeitar** com motivo
4. Acompanhe o histórico de publicações na aba **Publicados**

### 11.4 Conectar Bling ERP

1. Acesse **Bling Connection** no menu lateral
2. Clique em **Conectar com Bling**
3. Autorize o acesso na tela do Bling
4. O sistema sincronizará automaticamente produtos e pedidos

---

## 12. Roadmap e Próximas Etapas

As funcionalidades abaixo estão planejadas para implementação futura:

- **Integração com GitHub** para exportar código do projeto
- **Analytics de Atendimento WhatsApp** com taxa de resolução e satisfação do cliente
- **Automação de Resposta a Comentários** nas redes sociais
- **Dashboard Executivo Consolidado** com métricas de todas as plataformas
- **Sistema de Loyalty e Pontos** para clientes VIP
- **Integração com Google Analytics 4** para rastreamento avançado
- **Previsão de Demanda com Machine Learning** baseada em histórico de vendas

---

*Documentação gerada em 30 de março de 2026 — Feminnita Marketing Strategy v1.0*
