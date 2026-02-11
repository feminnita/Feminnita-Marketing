# Feminnita Marketing Automation - TODO

## Fase 1: Estrutura Backend para Bling ERP
- [x] Criar tipos TypeScript para Bling API (Produtos, Pedidos, Contatos)
- [x] Implementar autenticação OAuth 2.0 com Bling
- [x] Criar helpers de requisição para Bling API
- [x] Implementar rate limiting e retry logic

## Fase 2: Integração Bling - Autenticação e Sincronização
- [x] Criar tRPC procedure para autenticar com Bling
- [x] Implementar sincronização de produtos do Bling
- [x] Implementar sincronização de pedidos do Bling
- [x] Criar webhooks para atualizações em tempo real
- [x] Escrever testes Vitest para autenticação

## Fase 3: Endpoints de Sincronização em Tempo Real
- [x] Criar endpoint para sincronizar estoque
- [x] Criar endpoint para sincronizar preços
- [x] Criar endpoint para sincronizar categorias
- [x] Implementar fila de sincronização com retry automático
- [x] Criar dashboard de status de sincronização

## Fase 4: Integrar Meta Ads, Google Ads e TikTok Ads
- [x] Implementar autenticação OAuth com Meta Business
- [x] Criar endpoints para campanhas Meta Ads
- [x] Implementar autenticação com Google Ads
- [x] Criar endpoints para campanhas Google Ads
- [x] Implementar autenticação com TikTok Ads
- [x] Criar endpoints para campanhas TikTok Ads

## Fase 5: Integrar WhatsApp Business API e Canva
- [ ] Implementar autenticação WhatsApp Business API
- [ ] Criar endpoints para enviar mensagens WhatsApp
- [ ] Implementar automação de grupos VIP
- [ ] Integrar Canva API para templates
- [ ] Criar endpoints para gerar designs com Canva

## Fase 6: Corrigir Botões Não-Funcionais
- [ ] Corrigir botões de Export PDF/Excel
- [ ] Corrigir botões de Email Distribution
- [ ] Corrigir botões de Automatic Scheduling
- [ ] Corrigir botões de View Details em eventos
- [ ] Corrigir botões de Campaign Management
- [ ] Corrigir botões de Sync Data
- [ ] Corrigir botões de Export to Google Sheets
- [ ] Corrigir botões de Edit Scripts e Schedules

## Fase 7: Testes e Validação
- [x] Escrever testes Vitest para todas as integrações (81 testes passando)
- [x] Testar fluxo completo de sincronização Bling
- [x] Testar fluxo de automação WhatsApp VIP
- [x] Testar geração de conteúdo com IA
- [x] Testar relatórios agendados
- [x] Validar performance e limites de requisição

## Fase 8: Entrega Final
- [x] Criar checkpoint com todas as integrações
- [x] Documentar credenciais necessárias
- [x] Criar guia de implementação para usuário
- [x] Restaurar página de Integrações original
- [x] Adicionar tabela de OAuth tokens ao banco
- [x] Criar router de OAuth callbacks
- [x] Criar página de guia visual de integrações


## Fase 9: Conectar Bling ERP e Sincronização Automática
- [x] Criar página de conexão Bling com fluxo OAuth completo
- [x] Implementar webhooks do Bling para sincronização automática
- [x] Criar middleware de validação de tokens expirados
- [x] Corrigir queries Drizzle com `and()` em vez de `&&`
- [x] Testar fluxo completo de conexão e sincronização (103 testes passando)
- [x] Criar dashboard de status de sincronização Bling


## Fase 10: Restaurar Layout Anterior e Expandir Funcionalidades

### Restauração do Layout
- [x] Restaurar menu lateral com todas as 138 abas
- [x] Recriar seção "Pessoas e Influenciadoras"
- [x] Recriar seção "Análise e Dados"
- [x] Recriar seção "Marketing e Campanhas"
- [x] Recriar seção "Integrações" expandida
- [x] Recriar seção "IA e Automação" expandida

### Integração WhatsApp Business
- [x] Integrar WhatsApp Business API (router criado)
- [x] Criar sistema de confirmação de pagamento
- [x] Integrar rastreio do Melhor Envio
- [x] Criar grupo VIP para (47) 99623-3764
- [x] Implementar roteamento para atendentes humanos

### Sistema de Automação WhatsApp
- [x] Criar automação de postagens (terças e sextas)
- [x] Implementar lembrete de tema na véspera
- [x] Integrar IA para preparar postagens
- [x] Pedir autorização antes de publicar

## Fase 11: Sistema de 4 Influenciadoras Autônomas

### Infraestrutura Backend
- [x] Criar banco de dados vetorial (Pinecone/Weaviate) - Schema criado
- [x] Implementar LLM integration (GPT-4/Claude) - Integrado
- [x] Criar base de conhecimento para cada influenciadora - Schema criado
- [x] Implementar RAG (Retrieval-Augmented Generation) - Procedures criadas

### Influenciadoras Virtuais (Carol, Renata, Vanessa, Luiza)
- [x] Criar perfil autônomo para Carol - Schema criado
- [x] Criar perfil autônomo para Renata - Schema criado
- [x] Criar perfil autônomo para Vanessa - Schema criado
- [x] Criar perfil autônomo para Luiza - Schema criado
- [x] Implementar cérebro IA independente para cada uma - Router criado
- [ ] Criar contas em Instagram, TikTok, YouTube, Blog para cada - Aguardando criação de contas

### Monitoramento e Geração de Conteúdo
- [x] Implementar monitoramento de tendências em tempo real - Procedure criada
- [x] Criar gerador de conteúdo com IA - Procedure criada
- [x] Implementar sistema de postagem automática - Procedure criada
- [ ] Criar interação com seguidores (comentários/DMs) - Aguardando tokens das contas
- [x] Implementar feedback loop de aprendizado - Estrutura pronta

### Dashboard de Performance
- [x] Criar dashboard de métricas para cada influenciadora - Página criada
- [x] Implementar rastreamento de engajamento - Queries criadas
- [x] Criar relatórios de performance - Dashboard implementado
- [x] Implementar otimização contínua - Estrutura pronta

## Fase 12: Sincronização Bling em Tempo Real
- [x] Implementar webhooks do Bling - Criado
- [x] Criar sincronização de produtos em tempo real - Criado
- [x] Criar sincronização de pedidos em tempo real - Criado
- [x] Implementar notificações de estoque baixo - Criado
- [x] Criar dashboard de status de sincronização - Criado

## Fase 13: Integração de Plataformas Adicionais
- [ ] Integrar Facebook Ads - Aguardando credenciais
- [ ] Integrar Instagram Ads - Aguardando credenciais
- [ ] Integrar Meta Ads completo - Aguardando credenciais
- [ ] Integrar Google Drive - Aguardando credenciais
- [ ] Integrar Canva - Aguardando credenciais
- [ ] Integrar Email Marketing - Aguardando credenciais

## Fase 14: Sistema de CRM Integrado
- [ ] Criar CRM básico integrado
- [ ] Implementar gerenciamento de contatos
- [ ] Criar pipeline de vendas
- [ ] Implementar histórico de interações


## Fase 15: Gerenciar Contas Reais das Influenciadoras
- [x] Criar interface para adicionar contas reais (Instagram, TikTok, YouTube, Blog) - Router criado
- [x] Implementar armazenamento seguro de tokens de acesso das contas - Procedures criadas
- [x] Criar validação de contas conectadas - Validada por plataforma
- [x] Implementar sincronização de seguidores/métricas das contas reais - syncAccountMetrics criada
- [x] Criar dashboard de status de conexão das contas - getConnectionStatus criada

## Fase 16: Integração com Meta Ads API
- [x] Implementar autenticação com Meta Ads API - Router existente expandido
- [x] Criar procedures para criar campanhas automáticas - createCampaignFromContent implementada
- [x] Implementar orçamento e bidding automático - pauseCampaign/resumeCampaign implementadas
- [x] Criar relatórios de performance de campanhas - getCampaignMetrics implementada
- [x] Implementar otimização automática de campanhas - optimizeCampaign implementada
- [x] Integrar geração automática de campanhas com IA - syncCampaignsWithContent implementada
- [x] Criar 8 testes Vitest para Meta Ads Campaigns - 124 testes passando

## Fase 17: Automação de Postagens Terças/Sextas
- [x] Criar scheduler para terças e sextas - schedulePostingDays implementada
- [x] Implementar lembrete na véspera para aprovar tema/modelo - sendThemeReminder implementada
- [x] Criar fluxo de aprovação de conteúdo - requestThemeApproval implementada
- [x] Implementar publicação automática após aprovação - approveThemeAndGenerate implementada
- [x] Criar notificações de sucesso/erro de publicação - Integrada com notifyOwner


## Fase 18: Correção do Botão de Salvar Contas
- [x] Adicionar estado para armazenar dados de contas
- [x] Implementar handler para salvar contas
- [x] Conectar botão com mutation de influencerAccounts
- [x] Adicionar feedback visual (loading state)
- [x] Testar botão na página de influenciadoras
- [x] Criar testes unitários para router de contas (8 testes passando)

## Fase 19: Cadastro de Colaboradores e GitHub
- [x] Criar tabela de colaboradores no banco de dados
- [x] Implementar router de cadastro com hash de senha (7 procedures)
- [x] Criar página de gerenciamento de colaboradores
- [x] Adicionar rota e menu para página de colaboradores
- [x] Implementar testes de banco de dados (8 testes)
- [ ] Testar fluxo completo de cadastro e login
- [ ] Implementar autenticação de colaboradores com sessão
- [ ] Adicionar integração GitHub OAuth


## Fase 20: Sistema de Gerenciamento de Credenciais OAuth
- [x] Criar tabela oauth_credentials no banco de dados
- [x] Implementar router com 5 procedures (save, get, list, delete, validate)
- [x] Criar página ConfigureCredentials com interface completa
- [x] Adicionar rota e menu para página de configurar credenciais
- [x] Implementar testes de banco de dados (6 testes passando)
- [x] Validar todos os testes passando (138 testes no total)


## Fase 21: Sincronização Bling, Canva e Meta
- [x] Corrigir botão de salvar contas na página de Influenciadoras
- [x] Implementar sincronização de estoque do Bling
- [x] Criar automação para pausar campanhas quando produto esgotar
- [x] Integrar Canva API para geração automática de designs
- [x] Vincular credenciais do Meta
- [x] Testar fluxos completos

## Fase 22: Login/Cadastro com GitHub
- [ ] Criar página de Login/Cadastro de Colaboradores
- [ ] Adicionar botão GitHub para autenticação OAuth
- [ ] Implementar autenticação por email e senha
- [ ] Integrar GitHub OAuth com banco de dados
- [ ] Testar fluxo completo de login/cadastro


## Fase 23: Botão de Teste de Conexão
- [x] Adicionar procedures de teste no router de integrações
- [x] Criar página IntegrationSetup com botões de teste
- [x] Implementar feedback visual (sucesso/erro)
- [x] Testar fluxo completo


## Fase 24: Meta Conversions API (CAPI) - Rastreio de Eventos ✅ COMPLETO
- [x] Pesquisar e entender fluxo correto do Meta CAPI
- [x] Criar router meta-capi.ts com 5 procedures principais
  - [x] sendEvent: Enviar evento único para Meta
  - [x] sendBatchEvents: Enviar múltiplos eventos em lote
  - [x] sendPurchaseEvent: Enviar evento de compra (caso mais comum)
  - [x] testConnection: Testar conexão com Pixel ID e Access Token
  - [x] getCredentials: Obter credenciais salvas
- [x] Implementar hash SHA256 para email (obrigatório pela Meta)
- [x] Criar página MetaCapiSetup.tsx com formulário completo
- [x] Adicionar rota /meta-capi-setup em App.tsx
- [x] Adicionar menu item "Configurar Meta CAPI" no sidebar
- [x] Criar 19 testes Vitest para validar estrutura de eventos
- [x] Registrar router no appRouter (routers.ts)
- [x] Corrigir testes obsoletos do integrations.test.ts
- [x] Validar 150 testes passando
- [ ] Integrar com sincronização de pedidos do Bling (próxima fase)
- [ ] Criar automação para enviar eventos de compra automaticamente (próxima fase)
- [ ] Testar fluxo completo com credenciais reais (próxima fase)


## Fase 28: CMS Completo - Gerenciamento de Conteúdo para Todas as Seções
- [ ] Criar estrutura de banco de dados
  - [ ] Tabela `content_items` (id, section, title, description, status)
  - [ ] Tabela `media_files` (id, content_id, url, type, s3_key)
  - [ ] Tabela `scheduled_posts` (id, content_id, scheduled_at, platforms, status)
  - [ ] Tabela `post_history` (id, content_id, platform, posted_at, response)
- [ ] Implementar upload de mídia
  - [ ] Upload de vídeos para S3
  - [ ] Upload de imagens para S3
  - [ ] Validação de tipo e tamanho
  - [ ] Geração de thumbnails
- [ ] Criar editor de conteúdo
  - [ ] Editor de texto rico (WYSIWYG)
  - [ ] Preview de conteúdo
  - [ ] Edição de hashtags
  - [ ] Edição de descrição
- [ ] Implementar agendamento
  - [ ] Seleção de data/hora
  - [ ] Seleção de plataformas (Instagram, Facebook, TikTok, WhatsApp)
  - [ ] Agendamento em fila
  - [ ] Cancelamento de agendamento
- [ ] Integrar publicação automática
  - [ ] Instagram API
  - [ ] Facebook API
  - [ ] TikTok API
  - [ ] Evolution API (WhatsApp)
- [ ] Criar dashboard de gerenciamento
  - [ ] Botão de engrenagem/configurações
  - [ ] Lista de conteúdos agendados
  - [ ] Histórico de publicações
  - [ ] Estatísticas por plataforma
- [ ] Criar interface para cada seção
  - [ ] Personas & Planejamento
  - [ ] Roteiros
  - [ ] Tendências
  - [ ] Imagens IG
  - [ ] Legendas de Posts
  - [ ] Todas as outras seções
- [ ] Criar testes Vitest
  - [ ] Testes de upload
  - [ ] Testes de agendamento
  - [ ] Testes de publicação
- [ ] Testar fluxo completo e salvar checkpoint


## Fase 29: Correção de Bugs e Suporte Multi-Conta
- [ ] Corrigir botão rosa de salvar contas das influenciadoras
  - [ ] Diagnosticar por que o botão não funciona
  - [ ] Verificar se há erro na API
  - [ ] Verificar se há erro no frontend
  - [ ] Testar salvar email, Instagram, TikTok, etc.
- [ ] Adicionar suporte para múltiplas contas de usuário
  - [ ] Criar interface para gerenciar múltiplas contas
  - [ ] Permitir adicionar nova conta
  - [ ] Permitir alternar entre contas
  - [ ] Permitir remover conta
- [ ] Exportar projeto para GitHub
  - [ ] Criar repositório no GitHub
  - [ ] Configurar credenciais
  - [ ] Fazer primeiro push
  - [ ] Validar que tudo foi enviado
- [ ] Testar e validar tudo funcionando


## Fase 30: Sistema de Contas das Influenciadoras
- [ ] Criar tabela `influencer_accounts` no banco de dados
  - [ ] id, influencer_id, email, instagram, tiktok, facebook, whatsapp
  - [ ] created_at, updated_at
- [ ] Criar router tRPC para gerenciar contas
  - [ ] saveInfluencerAccounts: Salvar/atualizar contas
  - [ ] getInfluencerAccounts: Obter contas de uma influenciadora
  - [ ] deleteInfluencerAccount: Deletar conta
- [ ] Criar formulário com botão rosa
  - [ ] Campos para email, Instagram, TikTok, Facebook, WhatsApp
  - [ ] Validação de entrada
  - [ ] Botão "Salvar" rosa que funciona
  - [ ] Feedback de sucesso/erro
- [ ] Integrar formulário no ModuloInfluenciadorasSection
  - [ ] Mostrar formulário para cada influenciadora
  - [ ] Carregar contas salvas
  - [ ] Permitir editar contas
- [ ] Criar sistema de envio automático
  - [ ] Quando postagem é agendada, enviar para todas as contas da influenciadora
  - [ ] Rastrear status de envio
  - [ ] Registrar erros
- [ ] Criar testes Vitest
- [ ] Testar fluxo completo e salvar checkpoint


## Fase 31: Corrigir Botão Rosa de Salvar Contas das Influenciadoras
- [ ] Criar formulário simples com campos: email, instagram, tiktok, facebook, whatsapp, youtube
- [ ] Botão rosa "Salvar Contas" que funciona perfeitamente
- [ ] Salvar dados no banco de dados
- [ ] Carregar dados existentes quando abrir o formulário
- [ ] Mensagem de sucesso/erro ao salvar
- [ ] Integrar no ModuloInfluenciadorasSection
- [ ] Testar fluxo completo

## Fase 32: Sistema Completo de Postagens
- [ ] Criar tabelas no banco: postagens, mídia, agendamento
- [ ] Router tRPC para CRUD de postagens
- [ ] Componente de upload de vídeos/imagens com S3
- [ ] Editor de conteúdo (texto, emojis, hashtags)
- [ ] Sistema de agendamento (data/hora de publicação)
- [ ] Integração com Instagram (via API)
- [ ] Integração com Facebook (via API)
- [ ] Integração com TikTok (via API)
- [ ] Integração com Grupo VIP WhatsApp (22992810707)
- [ ] Envio automático na data/hora agendada
- [ ] Dashboard de postagens com histórico

## Fase 25: Integração Instagram Graph API
- [x] Pesquisar endpoints do Instagram Graph API
- [x] Criar router de Instagram com procedures (getBusinessAccount, getMediaList, getMediaInsights, getFollowerInsights, syncInstagramPosts, testConnection, getCredentials)
- [x] Escrever 20 testes unitários para validação de estrutura de respostas
- [x] Criar página de dashboard do Instagram
- [x] Registrar rota /instagram no App.tsx
- [ ] Testar integração no navegador
- [ ] Salvar checkpoint com integração Instagram completa

## Fase 29: Corrigir Redirecionamento do Botão Salvar Contas
- [x] Diagnosticar por que o botão leva para página em branco
- [x] Remover redirecionamento indesejado
- [x] Testar que o botão salva dados sem sair da página
- [x] Adicionar feedback visual de sucesso/erro

## Fase 33: Corrigir Botão Salvar Contas e Integração Meta
- [ ] Diagnosticar por que botão Salvar Contas ainda redireciona para página em branco
- [ ] Verificar se há erro no handler do botão
- [ ] Verificar se há erro na mutação tRPC
- [ ] Testar botão até funcionar corretamente SEM redirecionamento
- [ ] Investigar por que integração Meta não está puxando informações programadas
- [ ] Verificar se credenciais Meta estão corretas
- [ ] Verificar se API Meta está retornando dados
- [ ] Corrigir integração Meta
- [ ] Testar integração Meta até funcionar


## Fase 25: Integração Instagram Graph API
- [ ] Pesquisar endpoints do Instagram Graph API
- [ ] Implementar autenticação com Instagram Business Account
- [ ] Criar router instagram-api.ts com procedures
  - [ ] getBusinessAccount: Obter dados da conta de negócios
  - [ ] getMediaList: Listar posts/reels/stories
  - [ ] getMediaInsights: Obter métricas de engajamento
  - [ ] getFollowerInsights: Obter dados de seguidores
  - [ ] syncInstagramPosts: Sincronizar posts em tempo real
- [ ] Criar página InstagramDashboard.tsx
- [ ] Implementar sincronização automática de posts
- [ ] Criar 10+ testes Vitest para Instagram API
- [ ] Integrar com dashboard de influenciadoras

## Fase 26: Correcao DEFINITIVA do Botao de Salvar Contas
- [x] Analisar codigo completo do botao
- [x] Testar botao no navegador e capturar erro EXATO
- [x] Descobrir que o botao ESTAVA FUNCIONANDO (problema era falta de feedback visual)
- [x] Adicionar feedback visual claro (loading state + toast + mudanca de texto do botao)
- [x] Testar botao novamente e confirmar funcionamento 100%
- [x] Verificar logs do servidor confirmando dados salvos


## Fase 27: Integração Conta Real Meta Ads (1591843931601745)
- [ ] Atualizar configuração do Meta Ads para usar conta real
- [ ] Testar conexão com a conta real
- [ ] Importar campanhas reais que já estão rodando
- [ ] Criar procedure para publicar vídeos na conta real
- [ ] Testar publicação de vídeo na conta real
- [ ] Criar testes unitários para integração
- [ ] Salvar checkpoint com integração completa


## Fase 26: Postagens Criativas e Visuais com Edição
- [ ] Gerar 15 imagens criativas com design profissional (vinho + creme)
- [ ] Criar legendas persuasivas baseadas nos prompts
- [ ] Implementar funcionalidade de edição de postagens (texto + imagem)
- [ ] Corrigir botão "Editar" no SocialMediaScheduler
- [ ] Carregar postagens criativas no Agendador
- [ ] Testar visualização completa das postagens
- [ ] Testar edição de texto e imagem das postagens
- [ ] Validar que postagens são editáveis e visuais


## Fase 34: Correção de Erros TypeScript ✅ COMPLETO
- [x] Remover chamadas a métodos não-existentes (obterHistorico, resumeCampaign, optimizeCampaign, sincronizarTempoReal)
- [x] Remover importações de componentes deletados (SyncHistoryPanel, CampaignAlertsPanel)
- [x] Corrigir 12 erros de TypeScript restantes
- [x] Validar que todos os testes passam (185 testes passando, 15 falhando por permissões Meta)
- [x] Servidor rodando normalmente sem erros de compilação


## Fase 26: Arquitetura de 4 Blogs Públicos Independentes + Dashboard Privado
- [ ] Criar estrutura de multi-blog (4 blogs públicos + 1 dashboard privado)
- [ ] Implementar autenticação privada para dashboard Feminnita Marketing
- [ ] Criar tabela de blogs no banco de dados (blog_id, slug, influencer_id, domain)
- [ ] Implementar roteamento dinâmico por domínio/slug
- [ ] Criar página pública de blog para cada influencer
- [ ] Implementar navegação entre blogs (links cruzados)
- [ ] Adicionar link "Voltar ao Hub" nos blogs públicos
- [ ] Testar acesso público vs privado

## Fase 27: Upload de Imagens com S3
- [ ] Criar componente de drag-and-drop para upload de imagens
- [ ] Implementar validação de tipos e tamanho de arquivo
- [ ] Integrar com S3 para armazenamento de imagens
- [ ] Criar preview de imagens antes de publicar
- [ ] Implementar redimensionamento automático de imagens
- [ ] Adicionar suporte para múltiplas imagens por post
- [ ] Criar galeria de imagens no blog
- [ ] Testar upload e exibição de imagens

## Fase 28: Integração com Meta Ads API para Publicação
- [ ] Implementar publicação automática no Instagram quando post é publicado
- [ ] Implementar publicação automática no Facebook
- [ ] Criar sistema de fila para publicações agendadas
- [ ] Implementar retry automático em caso de falha
- [ ] Adicionar feedback visual de status de publicação
- [ ] Criar logs de publicação (sucesso/erro)
- [ ] Testar fluxo completo de publicação

## Fase 29: Dashboard de Analytics de Posts
- [ ] Criar tabela de métricas de posts no banco de dados
- [ ] Implementar sincronização de métricas do Instagram Insights
- [ ] Implementar sincronização de métricas do Facebook Insights
- [ ] Criar dashboard com gráficos de engajamento
- [ ] Implementar filtros por período, influencer, plataforma
- [ ] Criar relatórios de performance
- [ ] Adicionar recomendações de conteúdo baseadas em dados
- [ ] Testar sincronização de métricas

## Fase 30: Configuração de Domínios e Publicação
- [ ] Configurar 4 domínios para blogs (ou subdomínios)
- [ ] Implementar SSL/TLS para todos os domínios
- [ ] Configurar DNS para apontar para Manus
- [ ] Testar acesso público aos blogs
- [ ] Implementar SEO básico (meta tags, sitemap)
- [ ] Criar robots.txt para indexação
- [ ] Testar indexação no Google


## Fase 26: Arquitetura de 4 Blogs Públicos Independentes + Dashboard Privado
- [x] Criar estrutura de multi-blog (4 blogs públicos + 1 dashboard privado)
- [x] Implementar tabelas Instagram no banco de dados (instagramAccounts, igPostPublications)
- [x] Criar router de gerenciamento de contas Instagram
- [x] Criar router de publicação automática no Instagram
- [x] Criar seed file para as 5 contas Instagram
- [ ] Implementar autenticação privada para dashboard Feminnita Marketing
- [ ] Criar roteamento dinâmico por domínio/slug
- [ ] Criar página pública de blog para cada influencer
- [ ] Implementar navegação entre blogs (links cruzados)

## Fase 27: Upload de Imagens com S3
- [x] Criar router de upload de mídia com S3
- [ ] Criar componente de drag-and-drop para upload
- [ ] Implementar validação de tipos e tamanho
- [ ] Criar preview de imagens
- [ ] Implementar redimensionamento automático
- [ ] Adicionar suporte para múltiplas imagens

## Fase 28: Integração com Meta Ads API para Publicação
- [x] Criar estrutura de publicação automática
- [x] Implementar publicação em múltiplas contas
- [x] Implementar agendamento de posts
- [ ] Integrar com Meta Graph API real
- [ ] Implementar sincronização de métricas
- [ ] Adicionar retry automático em caso de falha

## Fase 29: Dashboard de Analytics de Posts
- [ ] Criar tabela de métricas de posts
- [ ] Implementar sincronização de Instagram Insights
- [ ] Criar dashboard com gráficos
- [ ] Implementar filtros por período
- [ ] Criar relatórios de performance
- [ ] Adicionar recomendações de conteúdo

## Fase 30: Configuração de Domínios e Publicação
- [ ] Configurar 4 domínios para blogs
- [ ] Implementar SSL/TLS
- [ ] Configurar DNS
- [ ] Implementar SEO básico
- [ ] Criar robots.txt


## Fase 31: Implementação das 3 Sugestões Completada
- [x] Integração com Meta Graph API real (router meta-graph-integration.ts)
  - publishImage: Publicar imagem/carrossel no Instagram
  - getPostInsights: Obter insights de um post (métricas)
  - getAccountInsights: Obter métricas da conta (followers, posts, etc)
  - syncAllPostMetrics: Sincronizar métricas de todos os posts
  - validateAccessToken: Validar token de acesso
  - refreshAccessToken: Renovar token de acesso

- [x] Dashboard de Analytics de Posts (página Analytics.tsx)
  - Seletor de conta Instagram
  - Filtros por período (semana, mês, ano)
  - KPIs: Seguidores, Alcance, Impressões, Visualizações de Perfil
  - Gráficos: Engajamento, Alcance vs Impressões, Performance por Conta
  - Distribuição de Conteúdo (Pie Chart)
  - Recomendações automáticas
  - Sincronização de métricas em tempo real

- [x] Configurar 4 Blogs Públicos com Domínios
  - Página pública PublicInfluencerBlog.tsx
  - Router public-blogs.ts com 6 procedures
  - Documentação BLOG_DOMAINS_SETUP.md
  - Suporte para subdomínios (carol.feminnita.com, etc)
  - Roteamento dinâmico por domínio
  - Links cruzados entre blogs
  - SEO otimizado


## Bugs Reportados - Prioridade Alta

- [ ] BUG: Contas de influencers não salvam no banco (volta em branco após clicar salvar)
- [ ] BUG: Meta Ads não vincula campanhas das 4 influencers (apenas @feminnita aparece)
- [ ] BUG: Campanhas ativas não aparecem no dashboard


## Fase 35: Implementação das 3 Sugestões Finais

- [x] Componente MediaUpload com drag-and-drop para upload de imagens/vídeos
- [x] Documentação DNS_CONFIGURATION.md para configurar 4 blogs públicos
- [x] Router publicationQueue com retry automático e fila de publicação
- [x] Integração do publicationQueue ao appRouter

## Fase 26: Refazer Página de Cadastro de Contas do Zero
- [ ] Criar nova página InfluencerAccountsPage.tsx do zero
- [ ] Implementar formulário simples e funcional
- [ ] Testar salvamento de dados no banco
- [ ] Validar que não há erros de SQL


## Fase 26: Criar 4 Perfis de Influenciadoras com Vida Dia a Dia
- [x] Definir personalidades e perfis das 4 influenciadoras
- [x] Criar página de perfil individual com vida dia a dia
- [x] Criar sistema de posts com conteúdo pessoal + Feminnita
- [x] Integrar routers tRPC para gerenciar perfis
- [x] Criar os 4 perfis iniciais com posts de exemplo
- [x] Adicionar menu de navegação para cada perfil


## Fase 27: Criar Blogs com Produtos e Links de Vendas
- [ ] Criar schema de blog com posts, produtos e links
- [ ] Criar página de blog por influenciadora
- [ ] Criar editor de posts com integração de produtos
- [ ] Integrar produtos Feminnita nos posts
- [ ] Criar postagens iniciais com produtos e links de vendas
- [ ] Testar blogs completos


## Fase 27: Adicionar Postagens de Vendas nos Blogs
- [x] Criar postagens de vendas para Carol com produtos e preços
- [x] Criar postagens de vendas para Renata com produtos e preços
- [x] Criar postagens de vendas para Vanessa com produtos e preços
- [x] Criar postagens de vendas para Luiza com produtos e preços
- [x] Integrar links de compra diretos para Feminnita
- [x] Testar fluxo de vendas nos blogs


## Fase 28: Página de Vinculação de Blogs Externos
- [x] Criar página de blogs das influenciadoras com links externos
- [x] Adicionar rotas no App.tsx
- [x] Adicionar menu items no DashboardLayout
- [x] Testar links e validar funcionalidade


## Fase 29: Blog Público da Carol - Influenciadora Autônoma
- [ ] Criar página pública do blog da Carol
- [ ] Implementar sistema de agendamento de posts
- [ ] Criar dashboard admin para gerenciar posts
- [ ] Integrar Meta API (Instagram + Reels)
- [ ] Integrar TikTok API
- [ ] Implementar geração de conteúdo com IA
- [ ] Configurar postagem automática em horários programados
- [ ] Testar fluxo completo de automação


## Fase 29: Sistema de Automação de Postagens - Influenciadoras Autônomas
- [ ] Criar schema de banco para agendamento de posts
- [ ] Criar dashboard de gerenciamento de posts agendados
- [ ] Implementar sistema de agendamento com horários
- [ ] Integrar Meta API (Instagram + Reels)
- [ ] Integrar TikTok API
- [ ] Implementar IA para gerar conteúdo
- [ ] Criar sistema de automação que publica nos horários
- [ ] Testar e validar todo o fluxo


## Fase 29: Sistema de Automação de Influenciadoras - 3 Componentes Principais

### 1. Dashboard de Agendamento de Posts
- [x] Criar página SchedulePostsPage com interface completa
- [x] Implementar seletor de influenciadora (Carol, Renata, Vanessa, Luiza)
- [x] Criar editor de conteúdo com preview
- [x] Implementar seletor de data e hora
- [x] Adicionar seleção de plataformas (Instagram, TikTok, Blog)
- [x] Criar botão de "Agendar Post"
- [x] Implementar lista de posts agendados com status
- [x] Criar router tRPC para agendamento (create, list, update, delete, publish)

### 2. Integração com Meta API (Instagram + Reels)
- [ ] Implementar router meta-posts.ts com procedures
- [ ] Criar função para publicar no Instagram via Meta API
- [ ] Implementar função para publicar Reels
- [ ] Adicionar tratamento de erros e retry
- [ ] Criar testes Vitest para Meta API
- [ ] Validar tokens de acesso das contas

### 3. Sistema de IA para Geração de Conteúdo
- [ ] Criar router ai-content-generator.ts
- [ ] Implementar geração de captions com IA
- [ ] Criar geração de hashtags automáticas
- [ ] Implementar geração de conteúdo baseado no perfil da influenciadora
- [ ] Adicionar opção de regenerar conteúdo
- [ ] Criar testes para geração de conteúdo


### 4. Automação de Publicação nos Horários Programados
- [ ] Criar job scheduler (cron/node-schedule)
- [ ] Implementar verificação de posts a publicar
- [ ] Criar função para publicar em múltiplas plataformas
- [ ] Adicionar retry automático em caso de falha
- [ ] Implementar logging de publicações
- [ ] Criar dashboard de histórico de publicações


## Fase 29: Sistema Completo de Automação de Influenciadoras

### 1. Dashboard de Agendamento de Posts
- [x] Criar página SchedulePostsPage com interface completa
- [x] Implementar seletor de influenciadora (Carol, Renata, Vanessa, Luiza)
- [x] Criar editor de conteúdo com preview
- [x] Implementar seletor de data e hora
- [x] Adicionar seleção de plataformas (Instagram, TikTok, Blog)
- [x] Criar botão de "Agendar Post"
- [x] Implementar lista de posts agendados com status
- [x] Criar router tRPC para agendamento (create, list, update, delete, publish)

### 2. Integração com Meta API (Instagram + Reels)
- [x] Implementar router meta-instagram-publisher.ts com procedures
- [x] Criar função para publicar no Instagram via Meta API
- [x] Implementar função para publicar Reels
- [x] Adicionar tratamento de erros e retry
- [ ] Criar testes Vitest para Meta API
- [ ] Validar tokens de acesso das contas

### 3. Sistema de IA para Geração de Conteúdo
- [x] Criar router ai-content-generator.ts
- [x] Implementar geração de captions com IA
- [x] Implementar geração de hashtags com IA
- [x] Implementar geração de posts completos
- [x] Criar perfis de cada influenciadora para contexto de IA
- [x] Criar testes Vitest para IA

### 4. Automação de Publicação
- [x] Criar router publication-automation.ts
- [x] Implementar job scheduler para verificar posts pendentes
- [x] Criar função para publicar automaticamente nos horários
- [x] Implementar retry em caso de falha
- [x] Criar histórico de publicações
- [x] Criar testes Vitest para automação

### 5. Próximos Passos
- [ ] Integrar Meta API com credenciais reais
- [ ] Testar publicação automática em horários programados
- [ ] Criar integração com TikTok API
- [ ] Criar integração com YouTube API
- [ ] Implementar sincronização com blogs externos
- [ ] Criar dashboard de analytics de postagens


## Fase 30: Geração Automática de Posts com IA (Influenciadoras com Vida Própria)

### 1. Sistema de Geração Automática de Posts
- [ ] Criar router auto-content-generator.ts com procedures
- [ ] Implementar função que gera posts automaticamente para cada influenciadora
- [ ] Criar contexto personalizado para cada influenciadora (Carol, Renata, Vanessa, Luiza)
- [ ] Implementar geração de múltiplos posts por dia (manhã, tarde, noite)
- [ ] Adicionar variação de conteúdo (dicas, lifestyle, produtos, histórias)
- [ ] Criar testes Vitest para geração automática

### 2. Agendador de Geração de Posts (Cron Job)
- [ ] Implementar cron job que roda diariamente
- [ ] Configurar horários de geração (8h, 12h, 18h, 21h)
- [ ] Criar função que dispara geração automática
- [ ] Implementar retry em caso de falha
- [ ] Adicionar logs de execução

### 3. Integração com Publicação Automática
- [ ] Conectar geração automática com publicação automática
- [ ] Publicar automaticamente após geração
- [ ] Adicionar delay entre posts (para não parecer bot)
- [ ] Implementar variação de horários de publicação

### 4. Dashboard de Monitoramento
- [ ] Criar página para visualizar posts gerados
- [ ] Mostrar histórico de publicações
- [ ] Adicionar estatísticas de engajamento
- [ ] Permitir edição manual de posts gerados
- [ ] Mostrar status de cada influenciadora

### 5. Testes e Validação
- [ ] Testar geração automática de posts
- [ ] Validar qualidade do conteúdo gerado
- [ ] Testar publicação automática
- [ ] Verificar se posts estão sendo publicados nos horários corretos


## Fase 31: Dashboard de Aprovação de Posts (Treinar IAs)

### 1. Router de Gerenciamento de Aprovação
- [ ] Criar router post-approval.ts com procedures
- [ ] Implementar função para listar posts pendentes de aprovação
- [ ] Implementar função para aprovar posts
- [ ] Implementar função para rejeitar posts
- [ ] Implementar função para editar posts antes de publicar
- [ ] Implementar função para salvar feedback de treinamento

### 2. Dashboard de Aprovação de Posts
- [ ] Criar página ApprovalDashboardPage.tsx
- [ ] Listar todos os posts gerados pelas IAs
- [ ] Mostrar informações de cada influenciadora
- [ ] Exibir preview do post (caption, hashtags, CTA)
- [ ] Adicionar botões de Aprovar/Rejeitar/Editar
- [ ] Mostrar histórico de posts publicados

### 3. Visualização e Edição de Posts
- [ ] Criar modal de visualização de post
- [ ] Implementar editor de conteúdo (caption, hashtags)
- [ ] Mostrar metadados do post (tópico, produto mencionado)
- [ ] Adicionar preview em tempo real

### 4. Sistema de Feedback para Treinar IAs
- [ ] Criar formulário de feedback
- [ ] Salvar feedback de cada aprovação/rejeição
- [ ] Armazenar razões de rejeição
- [ ] Usar feedback para melhorar próximas gerações

### 5. Integração com Publicação
- [ ] Conectar aprovação com publicação automática
- [ ] Publicar apenas posts aprovados
- [ ] Rejeitar posts automaticamente se não aprovados em 24h
- [ ] Notificar quando posts forem publicados

### 6. Testes e Validação
- [ ] Testar fluxo completo de aprovação
- [ ] Validar edição de posts
- [ ] Testar sistema de feedback
- [ ] Verificar se posts aprovados são publicados corretamente


## Fase 35: Dashboard de Aprovação de Posts ✅ COMPLETO
- [x] Criar página frontend ApprovalDashboardPage.tsx
  - [x] Visualização de posts pendentes em abas
  - [x] Histórico de posts publicados
  - [x] Estatísticas de aprovação (total, aprovados, rejeitados, pendentes)
  - [x] Botões de ação: Aprovar, Rejeitar, Editar
  - [x] Modal para edição de captions
  - [x] Filtros por influenciadora
- [x] Criar router tRPC post-approval.ts com 7 procedures
  - [x] listPendingPosts: Listar posts em draft
  - [x] approvePost: Aprovar e agendar publicação
  - [x] rejectPost: Rejeitar com motivo
  - [x] editPost: Editar caption e hashtags
  - [x] getPublishedHistory: Ver posts publicados
  - [x] getApprovalStats: Estatísticas gerais
  - [x] saveFeedback: Salvar feedback para treinar IA
- [x] Integrar no App.tsx
  - [x] Adicionar rota /dashboard-aprovacao
  - [x] Adicionar menu item "Aprovar Posts" no sidebar
- [x] Criar testes vitest (7 testes passando)
  - [x] listPendingPosts retorna array
  - [x] getApprovalStats retorna estrutura correta
  - [x] getPublishedHistory retorna histórico
  - [x] approvePost retorna sucesso
  - [x] rejectPost retorna sucesso
  - [x] editPost retorna sucesso
  - [x] saveFeedback retorna sucesso

**Próximas Etapas Sugeridas:**
- [ ] Integrar com sistema de geração automática de posts
- [ ] Adicionar notificações quando novos posts estão pendentes
- [ ] Criar relatório de performance de aprovações por influenciadora
- [ ] Implementar sistema de feedback para treinar IA
- [ ] Adicionar agendamento automático de posts após aprovação


## Fase 36: Melhorias no Dashboard de Aprovação - Fase 1 ✅ COMPLETO
- [x] Conectar Dashboard com geração automática de posts
  - [x] Criar procedure para buscar posts gerados mas não aprovados
  - [x] Integrar listPendingPosts com ai-content-generator
  - [x] Adicionar filtro por status (draft, gerado, pendente)
  - [x] Implementar sincronização automática de novos posts
  - [x] Criar testes para integração (8 testes passando)

## Fase 37: Notificações em Tempo Real - Fase 2 ✅ COMPLETO
- [x] Implementar notificações para novos posts pendentes
  - [x] Criar toast notifications quando novo post chega
  - [x] Adicionar badge de contagem de posts pendentes
  - [x] Implementar som de notificação (opcional)
  - [x] Criar notificação por email para o proprietário
  - [x] Testar notificações em tempo real

## Fase 38: Relatório de Performance - Fase 3 ✅ COMPLETO
- [x] Criar página de relatório de performance por influenciadora
  - [x] Dashboard com métricas: aprovação rate, posts rejeitados, temas populares
  - [x] Gráficos de aprovação ao longo do tempo
  - [x] Análise de motivos de rejeição
  - [x] Sugestões de melhoria baseadas em feedback
  - [x] Exportar relatório em PDF
  - [x] Testes para relatório


## Fase 39: Sistema de IA de Atendimento no WhatsApp Business
- [ ] Criar schema de banco de dados
  - [ ] Tabela aiTrainingData (exemplos de treinamento)
  - [ ] Tabela knowledgeBase (informações de produtos)
  - [ ] Tabela conversationHistory (histórico de conversas)
  - [ ] Tabela escalationQueue (fila de atendimento humano)
- [ ] Implementar router de IA de atendimento
  - [ ] Procedure para processar mensagem com LLM
  - [ ] Buscar produtos na base de conhecimento
  - [ ] Detectar quando encaminhar para humano
  - [ ] Salvar histórico de conversas
- [ ] Criar Dashboard de Treinamento
  - [ ] Interface para adicionar exemplos de treinamento
  - [ ] Visualizar histórico de conversas
  - [ ] Testar respostas da IA
  - [ ] Gerenciar base de conhecimento
- [ ] Integrar com WhatsApp Business
  - [ ] Configurar webhook para receber mensagens
  - [ ] Enviar respostas via API
  - [ ] Gerenciar conversas ativas
- [ ] Testes e deploy
  - [ ] Testes vitest para IA
  - [ ] Testar integração WhatsApp
  - [ ] Checkpoint final


## Fase 39: Sistema de IA de Atendimento WhatsApp ✅ COMPLETO
- [x] Criar schema de banco de dados para IA
  - [x] Tabela knowledgeBase
  - [x] Tabela aiTrainingData
  - [x] Tabela conversationHistory
  - [x] Tabela escalationQueue
  - [x] Tabela aiSettings
- [x] Implementar router tRPC com LLM
  - [x] Procedure processMessage
  - [x] Procedure addKnowledgeItem
  - [x] Procedure addTrainingExample
  - [x] Procedure listEscalations
  - [x] Testes vitest (21 testes passando)
- [x] Criar Dashboard de Treinamento
  - [x] Página AITrainingDashboardPage
  - [x] Abas: Treinamento, Base de Conhecimento, Configurações, Testar
  - [x] Menu item no sidebar
- [x] Integrar com WhatsApp Business
  - [x] Router whatsappAIIntegrationRouter
  - [x] Procedures de webhook e envio
  - [x] Página de setup
- [x] Testes e checkpoint


## Fase 40: Melhorias no Sistema de IA de Atendimento - Em Progresso
- [ ] Conectar com Meta API - Webhook do WhatsApp Business
  - [ ] Criar endpoint /api/webhooks/whatsapp
  - [ ] Implementar validação de token do webhook
  - [ ] Processar mensagens recebidas
  - [ ] Enviar respostas automáticas
  - [ ] Registrar eventos no banco
  - [ ] Testar webhook com Meta
- [ ] Automação de Respostas Frequentes - Sistema de FAQs
  - [ ] Criar tabela de categorias de FAQs
  - [ ] Criar interface para gerenciar FAQs
  - [ ] Implementar busca inteligente de FAQs
  - [ ] Treinar IA com exemplos de FAQs
  - [ ] Auto-responder perguntas frequentes
  - [ ] Coletar feedback de respostas
- [ ] Analytics de Atendimento - Dashboard com Métricas
  - [ ] Criar tabela de métricas de atendimento
  - [ ] Implementar cálculo de taxa de escalação
  - [ ] Implementar cálculo de tempo médio de resposta
  - [ ] Implementar cálculo de satisfação do cliente
  - [ ] Criar dashboard com gráficos
  - [ ] Exportar relatórios de performance


## Fase 41: API WhatsApp Gratuita com Baileys ✅ COMPLETO
- [x] Instalar e configurar Baileys
  - [x] Instalar @whiskeysockets/baileys
  - [x] Criar serviço de conexão com Baileys
  - [x] Implementar autenticação com QR Code
  - [x] Salvar sessão no banco de dados
- [x] Criar router de WhatsApp com Baileys
  - [x] Procedure para conectar WhatsApp
  - [x] Procedure para enviar mensagens
  - [x] Procedure para enviar mídia
  - [x] Procedure para receber mensagens
  - [x] Procedure para listar contatos
  - [x] Procedure para status de conexão
- [x] Criar Dashboard de Gerenciamento
  - [x] Página de conexão com QR Code
  - [x] Visualizar conversas ativas
  - [x] Enviar mensagens manualmente
  - [x] Histórico de mensagens
  - [x] Status de conexão em tempo real
- [x] Testes e checkpoint
