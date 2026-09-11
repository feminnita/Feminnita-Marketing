# Estudo: Transformar os agentes de marketing em profissionais de verdade

> Visão de expert em performance/marketplace. Foco: o que falta para Fernanda (Meta), Gabi (ML),
> agente Shopee, Isabela (Shein) etc. trabalharem como um humano sênior da área trabalharia.

## Tese central
Um profissional bom **não é bom por "personalidade/DNA"**. Ele é bom por 4 coisas:
1. **Olha os DADOS certos** antes de decidir.
2. Segue um **MÉTODO repetível** (não improvisa).
3. **MEDE o resultado** do que fez e ajusta.
4. Domina as **regras do CANAL** específico.

Hoje os agentes são, na prática, **"geradores de texto one-shot + um executor"**. "Salvar um curso na
mentalidade" ajuda, mas é a **menor** das alavancas. As grandes são **dados + método + feedback**.

## Diagnóstico do estado atual (confirmado no código)
- **Fluxo:** agente roda por cron/chat → propõe ações → tabela `agentActions` → executor (Playwright/API)
  → `executionLog` → notifica. Meta (Fernanda) e ML (Gabi) executam ações reais; Shopee lê; Shein é só texto.
- **Memória:** `agentMemory` existe, mas é **contexto estático/stateless** — não acumula "o que deu certo".
- **Dados existem:** `marketplace_ads_metrics`, `ads_evaluations`/`ml_ads_evaluations`, histórico de venda por
  SKU (VendaMarketplace), `knowledge updater` (tendências externas). **Mas o agente recebe input raso** —
  ninguém monta a query rica antes de ele raciocinar.
- **Elo que falta:** o agente **não revê se a campanha que recomendou rendeu**. Cada rodada começa do zero.
  Não há método padronizado embutido nem livro de decisões.

## As 6 camadas para profissionalizar (em ordem de ROI)

### 1. Briefing de dados — MAIOR alavanca ("o que um pro olha antes de decidir")
Antes do LLM raciocinar, um pré-processador monta um **dossiê estruturado** por produto/campanha:
histórico de venda por SKU (3/6/12 meses + sazonalidade), ROAS/ACoS/TACoS atuais, CTR/CPC/impressões/cliques,
estoque, **margem real (custo→preço)**, preço vs. concorrência, idade do anúncio, reputação.
Hoje esse dado existe mas o agente "chuta" porque recebe pouco. → Construir o **montador de contexto**.

### 2. Método / SOP embutido — você JÁ TEM (o "método de 7 passos")
As skills de auditoria (`ml/shopee/amazon/tiktok-campanhas-audit`) **são** o método profissional, mas vivem
no lado operador (Claude Code), não dentro do produto. **Portar o método como o PROCEDIMENTO PADRÃO de cada
agente**, com **limiares numéricos de decisão**, não só "seja especialista". Exemplos de gatilhos:
- Produto com venda boa e **sem anúncio** → sugerir para campanha.
- **ACoS > meta** e margem baixa → reduzir lance ou pausar.
- **CTR baixo** → problema de criativo/título (SEO), não de lance.
- Produto **sem saída + sem margem** → descontinuar.

### 3. Loop de feedback + livro de decisões — o que REALMENTE falta
Vira "gerador" em "profissional que mede": ao executar uma ação, **agendar medição (+7/+14 dias)** que compara
antes/depois e grava o veredito num **decisions ledger** que o agente **lê na próxima rodada**. Assim ele
aprende: "baixei o lance do X → ROAS subiu", "título novo do Y → CTR triplicou". É o que separa amador de pro.

### 4. Motor de SEO por marketplace
Tool que lê título/atributos/ficha atuais por marketplace, **pontua contra as regras do algoritmo daquele canal**
(ML ≠ Shopee ≠ Shein ≠ Amazon) e **reescreve** título/palavras-chave/atributos com os termos que **vendem**
(cruzando com busca + histórico de venda). Aplica via API/Playwright.

### 5. Especialização por canal (cada um tem alavanca diferente)
- **ML (Gabi):** Product Ads + posicionamento + ficha/reputação. Mais maduro → começar por aqui.
- **Shopee:** Ads + flash sale/cupom + SEO agressivo de título.
- **Shein (Isabela):** SEM ads → calendário de campanhas, flash, tendência, timing de coleção.
- **Meta (Fernanda):** "não está boa" provavelmente porque decide **sem briefing (camada 1) e sem feedback
  (camada 3)**; o playbook de segmentação/lançamento só rende se for **alimentado de dados e medido**.

### 6. Avaliação dos próprios agentes (eval)
Sem medir o agente, não dá pra saber se "salvar o curso" adiantou. Criar um **placar**: % de decisões que
melhoraram a métrica-alvo ao longo do tempo. Vira o termômetro do projeto e argumento de venda do SaaS.

## Como "treinar" (resposta direta à pergunta)
- **"Salvar um curso na mentalidade"** = útil como a **camada 2 (SOP/doutrina)**, mas **sozinho não resolve**.
- **Ordem de impacto:** Dados (1) > Método/SOP (2) > Feedback (3) > SEO (4) > Canal (5) > Eval (6) > polir persona.
- **Técnica recomendada:** SOP/prompt determinístico + **exemplos few-shot de decisões expert** + **RAG** sobre
  base de conhecimento (benchmarks + o próprio histórico de decisões/resultados). **Fine-tuning NÃO compensa agora.**

## Plano sugerido (sequência — provar valor em 1 canal antes de espalhar)
1. **Briefing de dados (camada 1) para ML** — maior ganho imediato.
2. **Embutir o SOP de 7 passos como procedimento da Gabi (ML)** com limiares numéricos.
3. **Ligar o loop de feedback** (medir +7/+14d → gravar ledger → ler na próxima rodada).
4. **Validar com eval.** Depois replicar para Meta/Shopee/Shein e adicionar o motor de SEO.

## Exemplo de como a Gabi (ML) operaria como profissional
1. Puxa o briefing: top SKUs por venda 6m, ACoS/ROAS por anúncio, CTR, margem, estoque.
2. Aplica o SOP: separa "escalar" (ROAS alto + estoque) / "corrigir SEO" (CTR baixo) / "cortar" (ACoS alto + margem baixa) / "promover sem ad" (vende e não anuncia).
3. Propõe ações com número (lance novo, título novo) → executa → agenda medição.
4. +14d: compara, grava no ledger, ajusta a próxima decisão. **Isso é o profissional.**
