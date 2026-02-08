# Configuração de Registros DNS para Blogs Públicos

## Visão Geral

Os 4 blogs públicos das influencers precisam de registros DNS apontando para o servidor Manus. Este documento descreve como configurar cada subdomínio.

## Arquitetura de Domínios

```
feminnita-marketing.manus.space (Dashboard Privado - Autenticado)
│
├── carol.feminnita.com (Blog Público - Carol)
├── renata.feminnita.com (Blog Público - Renata)
├── vanessa.feminnita.com (Blog Público - Vanessa)
└── luiza.feminnita.com (Blog Público - Luiza)
```

## Configuração de Registros DNS

### Pré-requisitos

1. **Domínio principal**: `feminnita.com` (você já deve ter este domínio)
2. **Acesso ao painel de controle DNS** do seu registrador de domínio
3. **URL do servidor Manus**: `feminnita-marketing.manus.space`

### Passo 1: Acessar o Painel DNS

Acesse o painel de controle do seu registrador de domínio (GoDaddy, Namecheap, etc) e procure pela seção de "DNS Records" ou "Gerenciar DNS".

### Passo 2: Adicionar Registros CNAME

Para cada influencer, adicione um registro CNAME:

#### Blog Carol

| Campo | Valor |
|-------|-------|
| Type | CNAME |
| Name | carol |
| Value | feminnita-marketing.manus.space |
| TTL | 3600 (1 hora) |

Resultado: `carol.feminnita.com` → `feminnita-marketing.manus.space`

#### Blog Renata

| Campo | Valor |
|-------|-------|
| Type | CNAME |
| Name | renata |
| Value | feminnita-marketing.manus.space |
| TTL | 3600 (1 hora) |

Resultado: `renata.feminnita.com` → `feminnita-marketing.manus.space`

#### Blog Vanessa

| Campo | Valor |
|-------|-------|
| Type | CNAME |
| Name | vanessa |
| Value | feminnita-marketing.manus.space |
| TTL | 3600 (1 hora) |

Resultado: `vanessa.feminnita.com` → `feminnita-marketing.manus.space`

#### Blog Luiza

| Campo | Valor |
|-------|-------|
| Type | CNAME |
| Name | luiza |
| Value | feminnita-marketing.manus.space |
| TTL | 3600 (1 hora) |

Resultado: `luiza.feminnita.com` → `feminnita-marketing.manus.space`

## Validação

Após adicionar os registros, aguarde 15-30 minutos para propagação DNS e teste com:

```bash
# Testar resolução DNS
nslookup carol.feminnita.com
nslookup renata.feminnita.com
nslookup vanessa.feminnita.com
nslookup luiza.feminnita.com

# Ou use dig
dig carol.feminnita.com
dig renata.feminnita.com
dig vanessa.feminnita.com
dig luiza.feminnita.com
```

Esperado: Todos devem resolver para `feminnita-marketing.manus.space`

## SSL/TLS Certificate

Manus fornece certificados SSL/TLS automaticamente para:
- `feminnita-marketing.manus.space` (domínio principal)
- `carol.feminnita.com` (subdomínio)
- `renata.feminnita.com` (subdomínio)
- `vanessa.feminnita.com` (subdomínio)
- `luiza.feminnita.com` (subdomínio)

**Nota**: Pode levar até 24 horas para o certificado ser emitido após a configuração DNS.

## Roteamento de Domínios

O servidor Manus detecta automaticamente qual domínio está sendo acessado e roteia para a página correta:

```
carol.feminnita.com → /blog/carol (ID: 1)
renata.feminnita.com → /blog/renata (ID: 2)
vanessa.feminnita.com → /blog/vanessa (ID: 3)
luiza.feminnita.com → /blog/luiza (ID: 4)
```

## Middleware de Roteamento

O middleware `domainRouter.ts` detecta o domínio e redireciona para a página correta:

```typescript
// Exemplo de roteamento
if (request.headers.host === 'carol.feminnita.com') {
  // Renderizar blog da Carol (ID: 1)
}
```

## Troubleshooting

### Domínio não resolve

1. Verifique se o registro CNAME foi adicionado corretamente
2. Aguarde propagação DNS (até 48 horas em casos extremos)
3. Limpe o cache DNS do seu navegador
4. Teste em um navegador privado

### Certificado SSL não funciona

1. Aguarde até 24 horas após configuração DNS
2. Verifique se o domínio resolve corretamente
3. Acesse `https://` (não `http://`)

### Página mostra erro 404

1. Verifique se o middleware de roteamento está ativo
2. Confirme que a influencer existe no banco de dados
3. Verifique os logs do servidor

## Exemplo de Configuração (GoDaddy)

1. Acesse https://dcc.godaddy.com/
2. Clique em "DNS" para o domínio `feminnita.com`
3. Clique em "Adicionar" e selecione "CNAME"
4. Preencha:
   - Name: `carol`
   - Value: `feminnita-marketing.manus.space`
   - TTL: `3600`
5. Clique em "Salvar"
6. Repita para os outros 3 subdomínios

## Exemplo de Configuração (Namecheap)

1. Acesse https://www.namecheap.com/myaccount/
2. Clique em "Manage" para o domínio `feminnita.com`
3. Vá para "Advanced DNS"
4. Clique em "Add New Record"
5. Selecione "CNAME Record"
6. Preencha:
   - Host: `carol`
   - Value: `feminnita-marketing.manus.space`
   - TTL: `3600`
7. Clique em "Save All Changes"
8. Repita para os outros 3 subdomínios

## Próximas Etapas

1. ✅ Configurar registros DNS
2. ⏳ Aguardar propagação (15-30 minutos)
3. ⏳ Aguardar certificado SSL (até 24 horas)
4. ✅ Testar acesso aos blogs
5. ✅ Verificar roteamento correto

## Suporte

Se encontrar problemas, verifique:
- Logs do servidor em `.manus-logs/devserver.log`
- Console do navegador (F12)
- Status do DNS em https://www.whatsmydns.net/
