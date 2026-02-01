# Feminnita Marketing Automation - TODO

## Fase 1: Estrutura Backend para Bling ERP
- [ ] Criar tipos TypeScript para Bling API (Produtos, Pedidos, Contatos)
- [ ] Implementar autenticação OAuth 2.0 com Bling
- [ ] Criar helpers de requisição para Bling API
- [ ] Implementar rate limiting e retry logic

## Fase 2: Integração Bling - Autenticação e Sincronização
- [ ] Criar tRPC procedure para autenticar com Bling
- [ ] Implementar sincronização de produtos do Bling
- [ ] Implementar sincronização de pedidos do Bling
- [ ] Criar webhooks para atualizações em tempo real
- [ ] Escrever testes Vitest para autenticação

## Fase 3: Endpoints de Sincronização em Tempo Real
- [ ] Criar endpoint para sincronizar estoque
- [ ] Criar endpoint para sincronizar preços
- [ ] Criar endpoint para sincronizar categorias
- [ ] Implementar fila de sincronização com retry automático
- [ ] Criar dashboard de status de sincronização

## Fase 4: Integrar Meta Ads, Google Ads e TikTok Ads
- [ ] Implementar autenticação OAuth com Meta Business
- [ ] Criar endpoints para campanhas Meta Ads
- [ ] Implementar autenticação com Google Ads
- [ ] Criar endpoints para campanhas Google Ads
- [ ] Implementar autenticação com TikTok Ads
- [ ] Criar endpoints para campanhas TikTok Ads

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
- [ ] Escrever testes Vitest para todas as integrações
- [ ] Testar fluxo completo de sincronização Bling
- [ ] Testar fluxo de automação WhatsApp VIP
- [ ] Testar geração de conteúdo com IA
- [ ] Testar relatórios agendados
- [ ] Validar performance e limites de requisição

## Fase 8: Entrega Final
- [ ] Criar checkpoint com todas as integrações
- [ ] Documentar credenciais necessárias
- [ ] Criar guia de implementação para usuário
- [ ] Validar todas as 142 abas funcionais
- [ ] Preparar para publicação
