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
