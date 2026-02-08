# Configuração de 4 Blogs Públicos com Domínios

## Arquitetura

A Feminnita Marketing possui uma arquitetura de múltiplos blogs:

### 1. Dashboard Privado (Apenas Colaboradores)
- **URL**: https://feminnita-marketing.manus.space
- **Acesso**: Autenticado (login obrigatório)
- **Conteúdo**: Dashboard completo com todas as funcionalidades
- **Funcionalidades**:
  - Gerenciar contas Instagram (Feminnita + 4 influencers)
  - Criar e agendar posts
  - Upload de imagens
  - Analytics de posts
  - Gerenciar colaboradores

### 2. 4 Blogs Públicos (Acesso Livre)

#### Blog Carol
- **URL**: https://carol.feminnita.com (ou blog-carol.feminnita.com)
- **Acesso**: Público (sem login)
- **Conteúdo**: Posts da influencer Carol
- **Roteamento**: `/blog/1` ou `/influencer/carol`

#### Blog Renata
- **URL**: https://renata.feminnita.com (ou blog-renata.feminnita.com)
- **Acesso**: Público (sem login)
- **Conteúdo**: Posts da influencer Renata
- **Roteamento**: `/blog/2` ou `/influencer/renata`

#### Blog Vanessa
- **URL**: https://vanessa.feminnita.com (ou blog-vanessa.feminnita.com)
- **Acesso**: Público (sem login)
- **Conteúdo**: Posts da influencer Vanessa
- **Roteamento**: `/blog/3` ou `/influencer/vanessa`

#### Blog Luiza
- **URL**: https://luiza.feminnita.com (ou blog-luiza.feminnita.com)
- **Acesso**: Público (sem login)
- **Conteúdo**: Posts da influencer Luiza
- **Roteamento**: `/blog/4` ou `/influencer/luiza`

## Implementação

### Opção 1: Subdomínios (Recomendado)
```
carol.feminnita.com → /blog/1
renata.feminnita.com → /blog/2
vanessa.feminnita.com → /blog/3
luiza.feminnita.com → /blog/4
```

**Vantagens**:
- Melhor SEO (cada blog tem seu próprio domínio)
- Melhor experiência do usuário
- Facilita compartilhamento em redes sociais

**Configuração DNS**:
```
CNAME carol.feminnita.com → feminnita.manus.space
CNAME renata.feminnita.com → feminnita.manus.space
CNAME vanessa.feminnita.com → feminnita.manus.space
CNAME luiza.feminnita.com → feminnita.manus.space
```

### Opção 2: Caminhos (Alternativa)
```
feminnita.com/blog/carol → /blog/1
feminnita.com/blog/renata → /blog/2
feminnita.com/blog/vanessa → /blog/3
feminnita.com/blog/luiza → /blog/4
```

## Roteamento Dinâmico

O roteamento será feito através de:

1. **Middleware de Domínio** (server-side)
   - Detecta qual domínio está sendo acessado
   - Redireciona para a página pública correta

2. **Componente PublicInfluencerBlog** (client-side)
   - Renderiza o blog da influencer específica
   - Carrega posts do banco de dados
   - Exibe analytics públicos

## Estrutura de Dados

### Tabela: influencer_posts
```sql
id | influencerId | content | caption | hashtags | platform | status | publishedAt | createdAt
```

### Tabela: ig_post_publications
```sql
id | postId | instagramAccountId | instagramPostId | caption | status | likes | comments | impressions | reach
```

## SEO Otimização

Cada blog terá:
- Meta tags customizadas
- Open Graph tags para compartilhamento
- Sitemap.xml
- robots.txt
- Canonical URLs
- Schema.org markup

## Próximos Passos

1. **Configurar domínios**
   - Adicionar registros DNS
   - Configurar SSL/TLS
   - Testar acesso

2. **Implementar middleware de roteamento**
   - Detectar domínio
   - Redirecionar para página correta

3. **Otimizar para SEO**
   - Adicionar meta tags
   - Criar sitemaps
   - Implementar analytics

4. **Testar publicação**
   - Publicar post de teste
   - Verificar sincronização de métricas
   - Validar links cruzados

## Links Cruzados

Cada blog terá links para:
- Página principal da Feminnita
- Outros blogs (Carol, Renata, Vanessa, Luiza)
- Contas Instagram
- Loja de produtos

## Exemplo de Navegação

```
Blog Carol
├── Post 1
├── Post 2
└── Links
    ├── Voltar para Feminnita
    ├── Blog Renata
    ├── Blog Vanessa
    ├── Blog Luiza
    └── Instagram @carol_influencer.2026
```

## Credenciais e Tokens

Cada conta Instagram terá:
- Access Token (armazenado no banco)
- Refresh Token (para renovação automática)
- Expiration Date
- Last Sync Date

## Monitoramento

Implementar monitoramento de:
- Uptime dos blogs
- Tempo de carregamento
- Taxa de erro
- Engajamento por blog
- Conversões

## Segurança

- HTTPS obrigatório
- Rate limiting
- CORS configurado
- Validação de entrada
- Proteção contra XSS/CSRF
