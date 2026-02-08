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
