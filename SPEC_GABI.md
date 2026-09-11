# Spec — Gabi (Mercado Livre) virar profissional de verdade

> Baseado na leitura do código real: `server/agents/ml-gabi-agent.ts`, `gabi-executor.ts`,
> `ml-ads-*`, `knowledge-updater.ts`, `services/agentMemory`, `integrations/bling.ts`,
> tabela `marketplace_ads_metrics`, painel `/acoes-agentes`.

## Diagnóstico do que a Gabi É hoje
- **Chat reativo** (`chatWithGabi`, Sonnet) — só age quando alguém pergunta no chat. Não tem rotina que olha a conta sozinha.
- **Dados que ela enxerga:** só métricas de **ads** (scraped 6/6h em `marketplace_ads_metrics`), detalhe do anúncio (atributos cheios/vazios + health) e lista ao vivo (preço/estoque).
- **Dados que ela NÃO enxerga (o buraco):** venda por SKU (3/6/12m), **curva ABC**, **margem real**, visitas/conversão orgânica, reputação, Full/Flex. → Ela não consegue dizer "curva A que vende e não anuncia" porque **não tem esse dado**.
- **Método:** a parte de EDS é boa (atributos/título estão no prompt). A parte de Ads é **genérica** ("olhe budget vs ROAS, campanhas dormentes") — sem regra ligada a venda/margem.
- **Sem aprendizado:** ela vê "o que já executei" (pra não repetir), mas **nunca mede se aquilo deu certo**.

## O que JÁ existe e vamos REAPROVEITAR (confirmado no código)
- ✅ Execução completa: listar/pausar/ativar/preço/estoque/atributos de anúncio; listar/criar/pausar/ativar/ajustar budget de campanha (API + Playwright).
- ✅ Coleta de métricas de ads 6/6h → `marketplace_ads_metrics` (tool `ml_get_ads_metrics`).
- ✅ Detalhe do anúncio com atributos vazios + **health score** (base do SEO).
- ✅ Painel de aprovação `/acoes-agentes` + `propose_ads_actions` / `execute_pending_actions`.
- ✅ **Integração Bling** (`integrations/bling.ts`): pedidos, produtos (com custo), estoque → **a fonte de venda e margem JÁ está na infra**.
- ✅ `agentMemory` + `knowledge-updater` (tendências externas).

## O que é NOVO (na ordem de construção)

### 1. Briefing de ML — "a ficha que a Gabi lê antes de decidir" (FUNDAÇÃO)
Novo módulo `gabi-briefing.ts` + tool `ml_get_briefing`. Para cada SKU/anúncio, agrega:
- Venda 3/6/12m + sazonalidade (Bling pedidos)
- **Curva ABC** (calculada: A carrega a loja, B, C)
- **Margem real** (custo do produto Bling vs preço de venda)
- ROAS/ACoS (já temos), CTR/visitas/conversão, estoque
- Completude da ficha + health (já temos), Full/Flex, reputação
> Sem isso, nenhuma das outras peças funciona de verdade.

### 2. Cérebro de ML — método nativo + regras numéricas (substitui os "7 passos do Meta")
Reescrever a seção de análise do `buildGabiPrompt` para um **SOP de Mercado Livre** que USA o briefing, com gatilhos como:
- Curva A que vende e **não tem anúncio** → propor campanha.
- **ACoS > margem** → reduzir lance ou cortar (não dá lucro).
- **CTR baixo** → problema de **título/ficha (SEO)**, não de lance.
- SKU vende forte no orgânico → **não desperdiçar ads** nele.
- Curva C parado + margem baixa → sinalizar encalhe/descontinuar.

### 3. Modo proativo — Gabi vira analista, não só chat
Run agendado (diário/semanal) que puxa o briefing da conta inteira, aplica o SOP e joga **diagnóstico + ações** em `/acoes-agentes` sozinha. Reusa `propose_ads_actions`.

### 4. Loop de feedback — "livro de decisões" (o que faz ela APRENDER)
Ao executar ação: salvar "foto do antes" → agendar re-medição **+7/+14d** → comparar antes/depois → gravar veredito em nova tabela `gabi_decisions` → alimentar no prompt (hoje mostra "o que fiz"; passa a mostrar "**deu certo?**").

### 5. Motor de SEO de ML
Run/tool que varre todos os anúncios, pontua título/atributos/ficha contra regras do ML + termos que vendem (do briefing) e **propõe reescrita** (aplica via `updateMLItemAttributes`/título). Reusa `ml_get_item_details` + `ml_get_category_attributes`.

### 6. Eval — placar da Gabi
Do livro de decisões: **% de decisões que melhoraram a métrica-alvo**. Termômetro do projeto + argumento de venda do SaaS.

## Ordem de entrega sugerida (cada fase já gera valor)
- **Fase 1:** Briefing (1) + Cérebro/SOP (2) → a Gabi já decide muito melhor.
- **Fase 2:** Loop de feedback (4) → ela aprende com o resultado.
- **Fase 3:** Modo proativo (3) → ela trabalha sozinha.
- **Fase 4:** SEO (5) + Eval (6).

## Fonte de dados da "História da Conta" — CONFIRMADO (06/06/2026)
Validado no Bling real + base da gestão:
- **Profundidade:** Bling devolve pedidos de **2023 → hoje** (3 anos), cada um com **itens (SKU+quantidade)**. ✅
- **Selecionar o que é ML (confiável):** classificar pelo **CNPJ do intermediador** do pedido — `03007331000141` ou `03007331000382` = ML. (Mesma regra de `_identificar_canal_a` em `gestao/blueprints/bling_a.py`, que já rotulou 36k pedidos.) **NÃO usar loja.id** — é furado (loja muda de id no tempo; mapa fallback erra: diz 204242681=Shopee sendo volume de ML).
- **Margem/líquido:** custo via Bling (produto) + enriquecer com `vendas_marketplace` da gestão (custo_real/repasse) — gestão tem 3 anos no nível da conta, mas detalhe por SKU só 7% no ML → por isso o por-SKU vem do Bling.
- **Visitas/conversão/posição (sinais só do ML):** API do ML, mais tarde (token ML estava expirado — precisa do refresh do StockHub).

**Plano de backfill:** paginar pedidos do Bling por data (2023→hoje) → detalhe por pedido (traz itens + intermediador) → ficar com os de CNPJ ML → agregar por SKU/mês → gravar na base "História da Conta". Custo: detalhe por pedido (otimizar filtrando no list quando possível); roda 1× em background. Depois incremental.

## Importante
Mesmo esqueleto (briefing → método → agir → medir) vale pros outros agentes (Fernanda/Meta, Luiza/Shopee, Isabela/Shein), mas **o conteúdo é nativo de cada canal**. Gabi é o piloto porque o ML é o mais maduro no sistema.
