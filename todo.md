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
- [x] Testar fluxo completo de conexão e sincronização (91 testes passando)
- [ ] Criar dashboard de status de sincronização Bling


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
- [ ] Criar banco de dados vetorial (Pinecone/Weaviate)
- [ ] Implementar LLM integration (GPT-4/Claude)
- [ ] Criar base de conhecimento para cada influenciadora
- [ ] Implementar RAG (Retrieval-Augmented Generation)

### Influenciadoras Virtuais (Carol, Renata, Vanessa, Luiza)
- [ ] Criar perfil autônomo para Carol
- [ ] Criar perfil autônomo para Renata
- [ ] Criar perfil autônomo para Vanessa
- [ ] Criar perfil autônomo para Luiza
- [ ] Implementar cérebro IA independente para cada uma
- [ ] Criar contas em Instagram, TikTok, YouTube, Blog para cada

### Monitoramento e Geração de Conteúdo
- [ ] Implementar monitoramento de tendências em tempo real
- [ ] Criar gerador de conteúdo com IA
- [ ] Implementar sistema de postagem automática
- [ ] Criar interação com seguidores (comentários/DMs)
- [ ] Implementar feedback loop de aprendizado

### Dashboard de Performance
- [ ] Criar dashboard de métricas para cada influenciadora
- [ ] Implementar rastreamento de engajamento
- [ ] Criar relatórios de performance
- [ ] Implementar otimização contínua

## Fase 12: Sincronização Bling em Tempo Real
- [ ] Implementar webhooks do Bling
- [ ] Criar sincronização de produtos em tempo real
- [ ] Criar sincronização de pedidos em tempo real
- [ ] Implementar notificações de estoque baixo
- [ ] Criar dashboard de status de sincronização

## Fase 13: Integração de Plataformas Adicionais
- [ ] Integrar Facebook Ads
- [ ] Integrar Instagram Ads
- [ ] Integrar Meta Ads completo
- [ ] Integrar Google Drive
- [ ] Integrar Canva
- [ ] Integrar Email Marketing

## Fase 14: Sistema de CRM Integrado
- [ ] Criar CRM básico integrado
- [ ] Implementar gerenciamento de contatos
- [ ] Criar pipeline de vendas
- [ ] Implementar histórico de interações
