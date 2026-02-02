# Meta Conversions API (CAPI) - Guia de Implementação

## O que é Meta CAPI?

**Meta Conversions API** é uma API que envia eventos de conversão diretamente do seu servidor para Meta (Facebook/Instagram). Diferente do Pixel tradicional que funciona no navegador, CAPI funciona no backend e oferece:

- ✅ **30-60% mais precisão** no rastreio de eventos
- ✅ **Funciona com adblock** e navegadores que bloqueiam cookies
- ✅ **Melhor ROAS** (retorno sobre investimento em anúncios)
- ✅ **Otimização automática** mais eficiente
- ✅ **Rastreio de eventos offline** (vendas por telefone, WhatsApp, etc)

## Como Configurar

### Passo 1: Obter Pixel ID e Access Token

1. Acesse [Events Manager](https://business.facebook.com/events_manager2)
2. Escolha o Pixel do seu site
3. Vá em **Configurações**
4. Role até encontrar **Conversions API**
5. Clique em **"Gerar token de acesso"**

Você receberá:
- **Pixel ID**: Identificador único do seu pixel (ex: `123456789`)
- **Access Token**: Token de autenticação (ex: `EAAx...`)
- **Test Event Code**: Código para testar sem afetar dados reais (ex: `TEST12345`)

### Passo 2: Configurar no Sistema Feminnita

1. Acesse o menu **Configurar Meta CAPI** no dashboard
2. Cole o **Pixel ID**
3. Cole o **Access Token**
4. Clique em **Testar Conexão** para validar
5. Clique em **Salvar Credenciais**

## Como Usar

### Enviar Evento de Compra (Caso Mais Comum)

```typescript
// No seu código React/Next.js
const { mutate: sendPurchase } = trpc.metaCapi.sendPurchaseEvent.useMutation();

// Quando uma compra for realizada:
await sendPurchase({
  email: "cliente@example.com",
  value: 197.00,
  currency: "BRL",
  orderId: "ORDER123",
  products: [
    {
      id: "PROD001",
      name: "Pijama Inverno",
      price: 197.00,
      quantity: 1,
    },
  ],
  clientIpAddress: "192.168.1.1", // Opcional
  clientUserAgent: "Mozilla/5.0...", // Opcional
});
```

### Enviar Evento Genérico

```typescript
const { mutate: sendEvent } = trpc.metaCapi.sendEvent.useMutation();

await sendEvent({
  event_name: "ViewContent", // Purchase, AddToCart, Checkout, etc
  email: "cliente@example.com",
  value: 100.00,
  currency: "BRL",
  contentName: "Pijama Inverno",
  clientIpAddress: "192.168.1.1",
  clientUserAgent: "Mozilla/5.0...",
});
```

### Enviar Múltiplos Eventos em Lote

```typescript
const { mutate: sendBatch } = trpc.metaCapi.sendBatchEvents.useMutation();

await sendBatch({
  events: [
    {
      event_name: "Purchase",
      email: "cliente1@example.com",
      value: 100.00,
      currency: "BRL",
    },
    {
      event_name: "Purchase",
      email: "cliente2@example.com",
      value: 200.00,
      currency: "BRL",
    },
  ],
  testEventCode: "TEST12345", // Opcional, para testar
});
```

## Tipos de Eventos Suportados

| Evento | Descrição | Exemplo |
|--------|-----------|---------|
| `ViewContent` | Visualização de produto | Usuário vê página de produto |
| `AddToCart` | Adicionado ao carrinho | Usuário clica "Adicionar ao carrinho" |
| `Checkout` | Iniciou checkout | Usuário clica "Ir para checkout" |
| `Purchase` | Compra realizada | Pedido confirmado |
| `Lead` | Geração de lead | Usuário preenche formulário |
| `CompleteRegistration` | Registro completo | Usuário cria conta |
| `Contact` | Contato | Usuário envia mensagem |

## Integração com Bling

Para automatizar o envio de eventos quando pedidos são criados no Bling:

```typescript
// No router de sincronização do Bling
// Quando um pedido é criado/atualizado:

await trpc.metaCapi.sendPurchaseEvent.mutate({
  email: pedido.cliente.email,
  value: pedido.total,
  currency: "BRL",
  orderId: pedido.id,
  products: pedido.itens.map(item => ({
    id: item.produtoId,
    name: item.produtoNome,
    price: item.preco,
    quantity: item.quantidade,
  })),
});
```

## Dados Obrigatórios vs Opcionais

### Obrigatórios
- `event_name`: Tipo de evento (Purchase, ViewContent, etc)
- `user_data.em`: Email hasheado em SHA256 (automático)

### Altamente Recomendados
- `value`: Valor da transação
- `currency`: Moeda (BRL, USD, EUR, etc)
- `custom_data`: Dados customizados do evento

### Opcionais
- `phone`: Telefone do cliente
- `firstName`: Primeiro nome
- `lastName`: Sobrenome
- `clientIpAddress`: IP do cliente
- `clientUserAgent`: User agent do navegador

## Hashing de Dados

A Meta exige que dados pessoais sejam hasheados em SHA256 antes do envio:

| Campo | Formato |
|-------|---------|
| Email | SHA256 do email em minúsculas |
| Telefone | SHA256 do número sem caracteres especiais |
| Nome | SHA256 do nome em minúsculas |
| Sobrenome | SHA256 do sobrenome em minúsculas |

**O router já faz isso automaticamente!** Você apenas fornece os dados em texto plano.

## Testando

### Usar Test Event Code

```typescript
await sendBatch({
  events: [
    {
      event_name: "Purchase",
      email: "test@example.com",
      value: 100.00,
      currency: "BRL",
    },
  ],
  testEventCode: "TEST12345", // Eventos com este código não afetam dados reais
});
```

### Verificar Eventos no Events Manager

1. Acesse [Events Manager](https://business.facebook.com/events_manager2)
2. Escolha seu Pixel
3. Vá em **Test Events**
4. Procure por eventos com seu `testEventCode`

## Troubleshooting

### Erro: "Credenciais não configuradas"
- Certifique-se de que configurou Pixel ID e Access Token
- Clique em "Testar Conexão" para validar

### Erro: "Invalid access token"
- Verifique se o Access Token está correto
- Tokens podem expirar - gere um novo no Events Manager

### Eventos não aparecem
- Verifique se está usando `testEventCode` para testes
- Aguarde alguns minutos para eventos aparecerem
- Confirme que o email está correto

### ROAS não melhora
- Certifique-se de que está enviando eventos suficientes (mínimo 50/dia)
- Verifique se os valores estão corretos
- Aguarde 7-14 dias para Meta otimizar

## Próximos Passos

1. **Configurar credenciais** via página "Configurar Meta CAPI"
2. **Testar com Test Event Code** para validar fluxo
3. **Integrar com Bling** para enviar eventos automaticamente
4. **Monitorar performance** no Events Manager
5. **Otimizar campanhas** com base em dados do CAPI

## Referências

- [Meta Conversions API Docs](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Events Manager](https://business.facebook.com/events_manager2)
- [API Reference](https://developers.facebook.com/docs/marketing-api/conversions-api/reference)
- [Best Practices](https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices)
