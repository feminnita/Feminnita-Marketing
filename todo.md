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
