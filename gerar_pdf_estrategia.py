#!/usr/bin/env python3
"""Gera PDF consolidado de estratégias do projeto Feminnita Marketing."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime

# ─── Cores ───────────────────────────────────────────────────────────────────
ROSA        = HexColor("#E91E8C")
ROSA_LIGHT  = HexColor("#FCE4F3")
ROSA_MED    = HexColor("#F48CBF")
CINZA_DARK  = HexColor("#2D2D2D")
CINZA_MED   = HexColor("#555555")
CINZA_LIGHT = HexColor("#F5F5F5")
VERDE       = HexColor("#27AE60")
AZUL        = HexColor("#2980B9")
LARANJA     = HexColor("#E67E22")
ROXO        = HexColor("#8E44AD")

# ─── Estilos ─────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

s_titulo_capa = ParagraphStyle("titulo_capa", fontSize=32, fontName="Helvetica-Bold",
    textColor=white, alignment=TA_CENTER, leading=40, spaceAfter=12)
s_sub_capa = ParagraphStyle("sub_capa", fontSize=16, fontName="Helvetica",
    textColor=HexColor("#FFD6EE"), alignment=TA_CENTER, leading=22)
s_data_capa = ParagraphStyle("data_capa", fontSize=11, fontName="Helvetica",
    textColor=HexColor("#FFB3DC"), alignment=TA_CENTER)

s_secao = ParagraphStyle("secao", fontSize=16, fontName="Helvetica-Bold",
    textColor=white, alignment=TA_LEFT, leading=20,
    leftIndent=0, spaceBefore=6, spaceAfter=6)
s_h2 = ParagraphStyle("h2", fontSize=13, fontName="Helvetica-Bold",
    textColor=ROSA, spaceBefore=14, spaceAfter=4, leading=18)
s_h3 = ParagraphStyle("h3", fontSize=11, fontName="Helvetica-Bold",
    textColor=CINZA_DARK, spaceBefore=10, spaceAfter=3, leading=15)
s_body = ParagraphStyle("body", fontSize=10, fontName="Helvetica",
    textColor=CINZA_MED, leading=15, spaceAfter=4, alignment=TA_JUSTIFY)
s_bullet = ParagraphStyle("bullet", fontSize=10, fontName="Helvetica",
    textColor=CINZA_MED, leading=14, leftIndent=16, spaceAfter=2,
    bulletIndent=4)
s_pendente = ParagraphStyle("pendente", fontSize=9.5, fontName="Helvetica",
    textColor=CINZA_MED, leading=13, leftIndent=20, spaceAfter=2)
s_badge = ParagraphStyle("badge", fontSize=9, fontName="Helvetica-Bold",
    textColor=white, alignment=TA_CENTER)
s_kpi_label = ParagraphStyle("kpi_label", fontSize=9, fontName="Helvetica",
    textColor=CINZA_MED, alignment=TA_CENTER)
s_kpi_valor = ParagraphStyle("kpi_valor", fontSize=20, fontName="Helvetica-Bold",
    textColor=ROSA, alignment=TA_CENTER, leading=24)

# ─── Helpers ─────────────────────────────────────────────────────────────────
def header_bar(texto, cor=ROSA):
    data = [[Paragraph(texto, s_secao)]]
    t = Table(data, colWidths=[17*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), cor),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
        ("ROUNDEDCORNERS", [4]),
    ]))
    return t

def kpi_row(items):
    """items = list of (valor, label, cor)"""
    cells = []
    for valor, label, cor in items:
        cells.append([
            Paragraph(valor, s_kpi_valor),
            Paragraph(label, s_kpi_label),
        ])
    t = Table([cells], colWidths=[17*cm / len(items)] * len(items))
    t.setStyle(TableStyle([
        ("BACKGROUND", (i,0), (i,0), HexColor("#FFF0F8")) for i in range(len(items))
    ] + [
        ("BOX",         (i,0), (i,0), 0.5, HexColor("#F0C0DE")) for i in range(len(items))
    ] + [
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("RIGHTPADDING",  (0,0), (-1,-1), 6),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    return t

def fase_table(fase_num, titulo, itens_pendentes, cor=ROSA):
    status_cor = LARANJA if itens_pendentes else VERDE
    status_txt = f"{len(itens_pendentes)} pendentes" if itens_pendentes else "✓ Completa"
    header = [
        [Paragraph(f"<b>Fase {fase_num}</b>", ParagraphStyle("fh", fontSize=10, fontName="Helvetica-Bold", textColor=white)),
         Paragraph(titulo, ParagraphStyle("ft", fontSize=10, fontName="Helvetica-Bold", textColor=white)),
         Paragraph(status_txt, ParagraphStyle("fs", fontSize=9, fontName="Helvetica-Bold", textColor=white, alignment=TA_CENTER))],
    ]
    rows = []
    for item in itens_pendentes[:8]:  # máx 8 por fase
        rows.append([
            Paragraph("○", ParagraphStyle("dot", fontSize=10, textColor=LARANJA, alignment=TA_CENTER)),
            Paragraph(item, s_pendente),
            Paragraph("", s_pendente),
        ])
    all_rows = header + (rows if rows else [])
    col_w = [2*cm, 11.5*cm, 3.5*cm]
    t = Table(all_rows, colWidths=col_w, repeatRows=1)
    style = [
        ("BACKGROUND",    (0,0), (-1,0), cor),
        ("BACKGROUND",    (2,0), (2,0), status_cor),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("RIGHTPADDING",  (0,0), (-1,-1), 6),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("ALIGN",         (0,0), (0,-1), "CENTER"),
        ("ALIGN",         (2,0), (2,-1), "CENTER"),
        ("GRID",          (0,0), (-1,-1), 0.3, HexColor("#E8D0E8")),
        ("ROUNDEDCORNERS", [4]),
    ]
    if rows:
        for i in range(1, len(rows)+1):
            bg = CINZA_LIGHT if i % 2 == 0 else white
            style.append(("BACKGROUND", (0,i), (-1,i), bg))
    t.setStyle(TableStyle(style))
    return t

# ─── Conteúdo ─────────────────────────────────────────────────────────────────

story = []
W, H = A4
margin = 2*cm

doc = SimpleDocTemplate(
    "ESTRATEGIA_FEMINNITA_2026.pdf",
    pagesize=A4,
    topMargin=margin, bottomMargin=margin,
    leftMargin=margin, rightMargin=margin,
    title="Estratégia Feminnita Marketing 2026",
    author="Feminnita",
)

# ════════════════════════ CAPA ════════════════════════
capa_data = [[
    Paragraph("FEMINNITA PIJAMAS", s_titulo_capa),
    Spacer(1, 0.3*cm),
    Paragraph("Plataforma de Marketing Digital — Estratégia 2026", s_sub_capa),
    Spacer(1, 0.5*cm),
    Paragraph(f"Gerado em {datetime.now().strftime('%d/%m/%Y')}", s_data_capa),
]]
capa_table = Table([[item] for item in [
    Paragraph("FEMINNITA PIJAMAS", s_titulo_capa),
    Spacer(1, 0.3*cm),
    Paragraph("Plataforma de Marketing Digital — Estratégia 2026", s_sub_capa),
    Spacer(1, 0.6*cm),
    Paragraph(f"Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}", s_data_capa),
]], colWidths=[17*cm])
capa_table.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,-1), ROSA),
    ("TOPPADDING",    (0,0), (-1,-1), 30),
    ("BOTTOMPADDING", (0,0), (-1,-1), 30),
    ("LEFTPADDING",   (0,0), (-1,-1), 20),
    ("RIGHTPADDING",  (0,0), (-1,-1), 20),
    ("ROUNDEDCORNERS", [8]),
]))
story.append(capa_table)
story.append(Spacer(1, 0.8*cm))

# KPIs do projeto
story.append(kpi_row([
    ("43", "Fases Planejadas", ROSA),
    ("SaaS", "Modelo de Negócio", AZUL),
    ("4", "Influenciadoras IA", ROXO),
    ("R$ 5K", "Budget/Mês Ads", VERDE),
]))
story.append(Spacer(1, 0.4*cm))

story.append(kpi_row([
    ("React 19", "Frontend", AZUL),
    ("Express + tRPC", "Backend", LARANJA),
    ("TiDB Cloud", "Banco de Dados", ROXO),
    ("Claude AI", "IA Integrada", ROSA),
]))
story.append(Spacer(1, 0.8*cm))

# ════════════════════════ 1. VISÃO GERAL ════════════════════════
story.append(header_bar("1. VISÃO GERAL DO PROJETO"))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph("Sobre a Feminnita", s_h2))
story.append(Paragraph(
    "A Feminnita é uma empresa de <b>atacado de pijamas femininos</b> que utiliza uma plataforma "
    "SaaS de automação de marketing digital para escalar vendas via influenciadoras virtuais com IA, "
    "WhatsApp, Meta Ads, Instagram e TikTok. O modelo de negócio foca em revendedoras, lojistas e "
    "influenciadoras com pedido mínimo de R$ 199 e margem de lucro de 100–200%.",
    s_body))

story.append(Paragraph("Stack Tecnológica", s_h2))
stack_data = [
    ["Camada", "Tecnologia", "Finalidade"],
    ["Frontend", "React 19 + Tailwind 4 + tRPC", "Interface SaaS completa"],
    ["Backend", "Express 4 + tRPC 11 + Node.js", "API e automações"],
    ["Banco de Dados", "TiDB Cloud (MySQL compat.)", "Dados persistentes"],
    ["ORM", "Drizzle ORM", "Queries type-safe"],
    ["IA / LLM", "Claude (Anthropic)", "Geração de conteúdo"],
    ["WhatsApp", "Baileys (gratuito)", "Automação de mensagens"],
    ["Pagamentos", "Bling ERP", "Pedidos e estoque"],
    ["Ads", "Meta Ads + Google Ads + TikTok", "Campanhas pagas"],
    ["Mídia Social", "Instagram Graph API", "Publicação automática"],
]
t = Table(stack_data, colWidths=[3.5*cm, 7*cm, 6.5*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), ROSA),
    ("TEXTCOLOR",     (0,0), (-1,0), white),
    ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 9),
    ("GRID",          (0,0), (-1,-1), 0.3, HexColor("#DDDDDD")),
    ("TOPPADDING",    (0,0), (-1,-1), 4),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ("ALIGN",         (0,0), (-1,-1), "LEFT"),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [white, CINZA_LIGHT]),
]))
story.append(t)
story.append(Spacer(1, 0.8*cm))

# ════════════════════════ 2. INFLUENCIADORAS ════════════════════════
story.append(header_bar("2. SISTEMA DE INFLUENCIADORAS VIRTUAIS COM IA", ROXO))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph(
    "O projeto conta com <b>4 influenciadoras virtuais autônomas</b>, cada uma com personalidade, "
    "público e estilo de conteúdo distintos. Elas geram posts, reels e stories automaticamente via IA, "
    "passando por um fluxo de aprovação antes de publicar.",
    s_body))

inf_data = [
    ["Influenciadora", "Perfil", "Foco de Conteúdo", "Plataforma Principal"],
    ["Carol",   "Jovem, moderna, trendy",      "Lançamentos, trends virais",   "TikTok + Instagram Reels"],
    ["Renata",  "Sofisticada, lifestyle",       "Estilo de vida, conforto",     "Instagram Feed"],
    ["Vanessa", "Alegre, próxima ao público",   "UGC, comunidade, engajamento", "Instagram Stories"],
    ["Luiza",   "Focada em conversão/vendas",   "Ofertas, urgência, CTA",       "WhatsApp + Stories"],
]
t = Table(inf_data, colWidths=[2.8*cm, 4*cm, 5.5*cm, 4.7*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), ROXO),
    ("TEXTCOLOR",     (0,0), (-1,0), white),
    ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 9),
    ("GRID",          (0,0), (-1,-1), 0.3, HexColor("#DDDDDD")),
    ("TOPPADDING",    (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [white, CINZA_LIGHT]),
]))
story.append(t)
story.append(Spacer(1, 0.8*cm))

# ════════════════════════ 3. ESTRATÉGIA DE CONTEÚDO ════════════════════════
story.append(header_bar("3. ESTRATÉGIA DE CONTEÚDO INSTAGRAM / TIKTOK", AZUL))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Objetivos de Crescimento (Mês)", s_h2))
story.append(kpi_row([
    ("+30%", "Seguidores", AZUL),
    ("+25%", "Engajamento", VERDE),
    ("+40%", "Vendas Atacado", ROSA),
    ("R$ 5K", "Budget de Ads", LARANJA),
]))
story.append(Spacer(1, 0.4*cm))

story.append(Paragraph("Estrutura Semanal de Conteúdo", s_h2))
semanas_data = [
    ["Semana", "Tema",                         "Persona",  "Foco Estratégico"],
    ["1",      "Lançamento & Engajamento",      "Carol",    "Apresentar coleção / gerar buzz"],
    ["2",      "Conteúdo Educativo",            "Renata",   "Dicas de estilo, autoridade de marca"],
    ["3",      "Comunidade & UGC",              "Vanessa",  "Conteúdo de clientes, prova social"],
    ["4",      "Conversão & Encerramento",      "Luiza",    "Ofertas, urgência, fechar vendas"],
]
t = Table(semanas_data, colWidths=[1.5*cm, 5*cm, 2.8*cm, 7.7*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), AZUL),
    ("TEXTCOLOR",     (0,0), (-1,0), white),
    ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 9),
    ("GRID",          (0,0), (-1,-1), 0.3, HexColor("#DDDDDD")),
    ("TOPPADDING",    (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ("ALIGN",         (0,0), (0,-1), "CENTER"),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [white, CINZA_LIGHT]),
]))
story.append(t)
story.append(Spacer(1, 0.4*cm))

story.append(Paragraph("Formatos de Conteúdo por Dia", s_h2))
formatos = [
    ("📸 Post Carrossel",       "2×/semana", "Antes/depois, coleções, lookbook"),
    ("🎬 Reel / TikTok",        "2×/semana", "Trending sounds, transformação, try-on"),
    ("📱 Stories (5/dia)",       "Diário",    "Engajamento, enquetes, CTAs para link"),
    ("🎥 TikTok Longo",         "1×/semana", "Roteiro gerado por IA via módulo TikTok Live"),
    ("💬 WhatsApp Broadcast",   "2×/semana", "Ofertas, recuperação de abandono"),
    ("📧 Blog / SEO",           "1×/semana", "Conteúdo indexável via módulo de blog"),
]
for icon_txt, freq, desc in formatos:
    row_data = [[
        Paragraph(f"<b>{icon_txt}</b>", ParagraphStyle("fmtT", fontSize=9.5, fontName="Helvetica-Bold", textColor=ROSA)),
        Paragraph(freq, ParagraphStyle("fmtF", fontSize=9, fontName="Helvetica-Bold", textColor=white, alignment=TA_CENTER)),
        Paragraph(desc, s_body),
    ]]
    t = Table(row_data, colWidths=[4.5*cm, 2.5*cm, 10*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (1,0), (1,0), ROSA_MED),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("ALIGN",         (1,0), (1,0), "CENTER"),
        ("BOX",           (0,0), (-1,-1), 0.3, HexColor("#DDCCDD")),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.1*cm))

story.append(Spacer(1, 0.8*cm))

# ════════════════════════ 4. ESTRATÉGIA ATACADO ════════════════════════
story.append(header_bar("4. ESTRATÉGIA DE VENDAS NO ATACADO", VERDE))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph(
    "O foco principal da Feminnita é o <b>atacado para revendedoras e lojistas</b>. "
    "Todos os canais de marketing convergem para geração de pedidos mínimos de R$ 199.",
    s_body))

atacado_data = [
    ["Segmento",          "Público-Alvo",            "Canal Principal",    "CTA"],
    ["Revendedoras",      "Mulheres, 25-45 anos",    "Instagram + WhatsApp","Peça seu kit atacado"],
    ["Lojistas",          "Proprietários de boutique","Meta Ads + LinkedIn","Solicite tabela de preços"],
    ["Influenciadoras",   "Creators 5K-100K seguid.","TikTok + Instagram", "Parceria afiliada"],
    ["Consumidor Final",  "Mulheres 20-50 anos",     "Instagram Stories",  "Compre no atacado mínimo"],
]
t = Table(atacado_data, colWidths=[3.5*cm, 4.5*cm, 4.5*cm, 4.5*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), VERDE),
    ("TEXTCOLOR",     (0,0), (-1,0), white),
    ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 9),
    ("GRID",          (0,0), (-1,-1), 0.3, HexColor("#DDDDDD")),
    ("TOPPADDING",    (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [white, CINZA_LIGHT]),
]))
story.append(t)
story.append(Spacer(1, 0.4*cm))

story.append(Paragraph("Métricas de Negócio", s_h2))
story.append(kpi_row([
    ("R$ 199", "Pedido Mínimo", VERDE),
    ("100–200%", "Margem Revenda", AZUL),
    ("R$ 5K/mês", "Budget Ads", ROSA),
    ("10+ canais", "Distribuição", ROXO),
]))
story.append(Spacer(1, 0.8*cm))

# ════════════════════════ 5. MÓDULOS IMPLEMENTADOS ════════════════════════
story.append(PageBreak())
story.append(header_bar("5. MÓDULOS JÁ IMPLEMENTADOS NA PLATAFORMA"))
story.append(Spacer(1, 0.3*cm))

modulos = [
    ("Autenticação & Multi-usuário",    "Login, cadastro, sessões, colaboradores, OAuth GitHub"),
    ("Dashboard & Analytics",           "KPIs em tempo real, funil, ROI consolidado, LTV por persona"),
    ("Campanhas de Marketing",          "CRUD completo, status, orçamento, performance por campanha"),
    ("Influenciadoras Virtuais",        "4 personas com IA, geração de conteúdo, fluxo de aprovação"),
    ("Blog das Influenciadoras",        "CMS completo, posts SEO, domínios personalizados"),
    ("Agendamento de Posts",            "Calendário, fila de publicação, integração Instagram"),
    ("WhatsApp (Baileys)",              "Mensagens automáticas, IA de atendimento, recuperação abandono"),
    ("Meta Ads / Facebook Ads",         "Campanhas, métricas reais, pausa automática por estoque"),
    ("Google Ads",                      "Estrutura pronta (aguarda credenciais)"),
    ("TikTok Ads",                      "Estrutura pronta (aguarda credenciais)"),
    ("Instagram Graph API",             "Publicação, métricas, contas de influenciadoras"),
    ("Canva Integration",               "Templates, geração de designs (aguarda credenciais)"),
    ("Bling ERP Sync",                  "Sync OAuth A (série 2/3 + DIFAL), OAuth B (Shein/TikTok)"),
    ("Meta CAPI",                       "Rastreamento de conversões server-side"),
    ("Sistema de Afiliadas",            "Links rastreáveis, comissões, ranking gamificado"),
    ("Recuperação de Abandono",         "Sequências WhatsApp em 3 etapas (1h/24h/72h)"),
    ("Brand Book Digital",              "Paleta, fontes, tom de voz da marca"),
    ("Drops / Coleções",                "Countdown para lançamentos, metas de venda"),
    ("UGC Collector",                   "Coleta e aprovação de conteúdo gerado por clientes"),
    ("TikTok Live Commerce",            "Planejamento de lives, roteiro com IA, métricas"),
    ("Cupons & Promoções",              "CRUD completo, controle de uso, por persona/campanha"),
    ("Templates de Conteúdo",           "Biblioteca de templates reutilizáveis com contador de uso"),
    ("Gerador de Conteúdo IA",          "Legendas, hashtags, otimização por persona"),
    ("Chat de Suporte IA",              "Atendimento contextualizado com histórico de conversa"),
    ("Relatórios & Exportação",         "Mensal, semanal, por persona, export CSV/JSON"),
    ("A/B Testing",                     "Comparação de variações com análise de taxa de conversão"),
    ("Biblioteca de Mídia",             "Upload e gestão de assets por coleção"),
    ("Equipe de Marketing",             "Briefs de conteúdo, pesquisa de mercado, banco de imagens"),
    ("Notificações & Alertas",          "Alertas inteligentes de campanha em tempo real"),
    ("Integração CRM",                  "Gestão de leads, funil de vendas"),
    ("Segmentação de Clientes",         "Por plataforma, persona e histórico"),
    ("Loyalty / Pontos",                "Estrutura de tiers bronze/prata/ouro/diamante"),
    ("Smart Alerts",                    "Monitoramento automático de performance de campanhas"),
]

mod_data = [["Módulo", "Descrição"]] + [[n, d] for n, d in modulos]
t = Table(mod_data, colWidths=[5.5*cm, 11.5*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), ROSA),
    ("TEXTCOLOR",     (0,0), (-1,0), white),
    ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTNAME",      (0,1), (0,-1), "Helvetica-Bold"),
    ("TEXTCOLOR",     (0,1), (0,-1), CINZA_DARK),
    ("FONTSIZE",      (0,0), (-1,-1), 8.5),
    ("GRID",          (0,0), (-1,-1), 0.3, HexColor("#EEDDEE")),
    ("TOPPADDING",    (0,0), (-1,-1), 4),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [white, ROSA_LIGHT]),
]))
story.append(t)
story.append(Spacer(1, 0.8*cm))

# ════════════════════════ 6. ROADMAP DE PENDÊNCIAS ════════════════════════
story.append(PageBreak())
story.append(header_bar("6. ROADMAP — ITENS PENDENTES", LARANJA))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph(
    "Os itens abaixo representam as tarefas ainda não concluídas, agrupadas por área estratégica. "
    "Prioridade: <b>Credenciais de API</b> primeiro (desbloqueiam todas as integrações), "
    "depois <b>Banco de Dados</b> (migrations), depois <b>Novas Funcionalidades</b>.",
    s_body))
story.append(Spacer(1, 0.3*cm))

# Prioridade 1 — Credenciais
story.append(fase_table("P1", "Configurar Credenciais de API (desbloqueador)", [
    "Criar conta Meta Business e obter token de longa duração (Meta Ads / CAPI / Instagram)",
    "Criar app Google Ads e configurar client_id + client_secret",
    "Criar app TikTok for Business para campanhas e publicação",
    "Criar app Canva Connect e obter client credentials",
    "Configurar WhatsApp Business API (número verificado)",
    "Configurar conta Stripe ou gateway de pagamento nacional",
    "Definir INSTAGRAM_ACCOUNT_ID no .env de produção",
    "Configurar META_AD_ACCOUNT_ID no .env de produção",
], LARANJA))
story.append(Spacer(1, 0.2*cm))

# Prioridade 2 — Migrations
story.append(fase_table("P2", "Rodar Migrations no TiDB Cloud (banco de produção)", [
    "Migration 0015 (campanhas/automações) — verificar se já foi rodada",
    "Migration 0016 (publication queue jobs)",
    "Migration 0017 — tabelas de afiliadas",
    "Migration 0018 — abandono recovery (sequências + logs)",
    "Migration 0019 — brand_book",
    "Migration 0020 — drops (coleções sazonais)",
    "Migration 0021 — ugc_submissions",
    "Migration 0022 — tiktok_lives",
], AZUL))
story.append(Spacer(1, 0.2*cm))

story.append(fase_table("P2b", "Migrations adicionais", [
    "Migration 0023 — cupons",
    "Migration 0024 — content_templates",
], AZUL))
story.append(Spacer(1, 0.2*cm))

# Prioridade 3 — Funcionalidades
story.append(fase_table("P3", "Contas das Influenciadoras (Instagram/TikTok reais)", [
    "Criar contas Instagram para Carol, Renata, Vanessa e Luiza",
    "Criar contas TikTok para Carol e Luiza (foco em TikTok Live)",
    "Configurar tokens de acesso nas influencer_accounts do banco",
    "Testar publicação automática via Instagram Publisher",
    "Testar agendamento de posts via ScheduledPosts",
], ROXO))
story.append(Spacer(1, 0.2*cm))

story.append(fase_table("P4", "Consolidação de Routers Duplicados", [
    "Unificar 5 routers de Instagram (instagram.ts, instagram-api.ts, instagram-accounts.ts, instagram-publisher.ts, meta-instagram-publisher.ts)",
    "Unificar 4 routers de Canva (canva-integration.ts, canva-real.ts + duplicatas)",
    "Unificar 6 routers de Meta (meta-ads.ts, meta-capi.ts, meta-graph-api.ts, meta-graph-integration.ts, meta-integration.ts, meta-real.ts)",
    "Adicionar rate limiting centralizado nos routers de API externa",
    "Criar tabela design_history no schema para canva-integration.ts",
], CINZA_MED))
story.append(Spacer(1, 0.2*cm))

story.append(fase_table("P5", "Melhorias de UX e Performance", [
    "Dividir bundle JS (4MB) em chunks com dynamic import() — reduzir para <500KB por chunk",
    "Adicionar loading skeletons nos dashboards pesados",
    "Implementar paginação nas listagens com muitos registros",
    "Adicionar service worker para cache offline básico",
    "Melhorar INFLUENCER_PROFILES: carregar cores/emoji dinamicamente do DB",
], CINZA_DARK))
story.append(Spacer(1, 0.8*cm))

# ════════════════════════ 7. AUTOMAÇÕES WHATSAPP ════════════════════════
story.append(header_bar("7. AUTOMAÇÕES DE WHATSAPP & E-COMMERCE", HexColor("#25D366")))
story.append(Spacer(1, 0.3*cm))

automacoes = [
    ("Recuperação de Abandono",    "3 mensagens: 1h (lembrete), 24h (urgência de estoque), 72h (oferta especial)"),
    ("Boas-vindas Revendedoras",   "Mensagem automática quando novo contato entra na lista de atacado"),
    ("Confirmação de Pedido",      "Integrado com Bling ERP — dispara após pedido criado"),
    ("Rastreio de Entrega",        "Notificação com código de rastreio quando pedido é expedido"),
    ("Pós-venda (NPS)",            "7 dias após entrega — coleta satisfação e incentiva recompra"),
    ("Reativação de Clientes",     "Clientes sem pedido há 60 dias — oferta personalizada"),
    ("Aprovação de Posts (IA)",    "IA avisa via WhatsApp quando post aguarda aprovação"),
    ("Alerta de Estoque Baixo",    "Quando Bling sync detecta produto < 5 unidades"),
]
for nome, desc in automacoes:
    row = [[
        Paragraph(f"<b>{nome}</b>", ParagraphStyle("an", fontSize=9.5, fontName="Helvetica-Bold", textColor=HexColor("#128C7E"))),
        Paragraph(desc, s_body),
    ]]
    t = Table(row, colWidths=[4.5*cm, 12.5*cm])
    t.setStyle(TableStyle([
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("BOX",           (0,0), (-1,-1), 0.3, HexColor("#CCEECC")),
        ("BACKGROUND",    (0,0), (0,0), HexColor("#E8F5E9")),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.08*cm))

story.append(Spacer(1, 0.8*cm))

# ════════════════════════ 8. INTEGRAÇÕES & STATUS ════════════════════════
story.append(PageBreak())
story.append(header_bar("8. STATUS DAS INTEGRAÇÕES", CINZA_DARK))
story.append(Spacer(1, 0.3*cm))

int_data = [
    ["Integração",        "Status",          "Obs"],
    ["Bling ERP (série A)","✓ Ativo",        "OAuth funcionando, sync automático 07:00"],
    ["Bling ERP (série B)","⚠ Parcial",      "403 em /pedidos/vendas — problema de escopo do token"],
    ["Instagram Graph",   "⚠ Config. Req.", "Precisa INSTAGRAM_ACCOUNT_ID + token longa duração"],
    ["Meta Ads",          "⚠ Config. Req.", "Precisa META_AD_ACCOUNT_ID + token Meta Business"],
    ["Meta CAPI",         "✓ Implementado", "Precisa configurar CAPI_ACCESS_TOKEN em produção"],
    ["Google Ads",        "○ Aguardando",   "Estrutura pronta, falta credenciais OAuth"],
    ["TikTok Ads",        "○ Aguardando",   "Estrutura pronta, falta app TikTok Business"],
    ["Canva API",         "○ Aguardando",   "Estrutura pronta, falta client credentials"],
    ["WhatsApp (Baileys)","✓ Implementado", "Gratuito, precisa número WhatsApp conectado"],
    ["Google Drive",      "⚠ Config. Req.", "Service account JSON não configurado"],
    ["Stripe",            "○ Aguardando",   "Integração pendente, usar gateway BR ou Bling"],
    ["TikTok Live",       "✓ Módulo OK",    "Router + UI implementados, precisa de live ativa"],
    ["GitHub OAuth",      "✓ Ativo",        "Login de colaboradores via GitHub funcionando"],
]
cor_status = {
    "✓": HexColor("#E8F5E9"),
    "⚠": HexColor("#FFF8E1"),
    "○": HexColor("#F5F5F5"),
}
t = Table(int_data, colWidths=[4*cm, 3.2*cm, 9.8*cm])
row_styles = [
    ("BACKGROUND",    (0,0), (-1,0), CINZA_DARK),
    ("TEXTCOLOR",     (0,0), (-1,0), white),
    ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 9),
    ("GRID",          (0,0), (-1,-1), 0.3, HexColor("#DDDDDD")),
    ("TOPPADDING",    (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ("VALIGN",        (0,0), (-1,-1), "TOP"),
]
for i, row in enumerate(int_data[1:], 1):
    prefix = row[1][:1]
    bg = cor_status.get(prefix, white)
    row_styles.append(("BACKGROUND", (0,i), (-1,i), bg))
t.setStyle(TableStyle(row_styles))
story.append(t)
story.append(Spacer(1, 0.8*cm))

# ════════════════════════ 9. PRÓXIMOS PASSOS ════════════════════════
story.append(header_bar("9. PRÓXIMOS PASSOS — AÇÃO IMEDIATA", ROSA))
story.append(Spacer(1, 0.3*cm))

passos = [
    ("1", "Configurar credenciais de API",
     "Meta Business, Instagram, Google Ads, TikTok, Canva — sem isso as integrações ficam travadas"),
    ("2", "Rodar migrations no TiDB Cloud",
     "Executar SQL das migrations 0015–0024 para ativar módulos de afiliadas, drops, brand book, UGC, TikTok Live, cupons e templates"),
    ("3", "Criar contas das influenciadoras",
     "Instagram e TikTok para Carol, Renata, Vanessa e Luiza — conectar via OAuth no painel"),
    ("4", "Corrigir Bling B (403 em pedidos)",
     "Revogar token atual, reautenticar com escopo correto incluindo vendas/pedidos"),
    ("5", "Code splitting do bundle",
     "Dividir 4MB de JS em chunks para melhorar performance de carregamento (meta: <500KB inicial)"),
    ("6", "Consolidar routers duplicados",
     "Unificar Instagram, Canva e Meta em routers únicos — reduz manutenção e elimina duplicação de lógica"),
    ("7", "Testar fluxo completo de publicação",
     "Post gerado por IA → aprovação no dashboard → publicação automática no Instagram/TikTok"),
    ("8", "Configurar CRON de sync em produção",
     "Verificar cron_sync.py e cron_nf_hora.py ativos no servidor de deploy"),
]

for num, titulo, desc in passos:
    row = [[
        Paragraph(num, ParagraphStyle("pn", fontSize=14, fontName="Helvetica-Bold",
            textColor=white, alignment=TA_CENTER)),
        [Paragraph(f"<b>{titulo}</b>", ParagraphStyle("pt", fontSize=10, fontName="Helvetica-Bold",
            textColor=CINZA_DARK, spaceBefore=0)),
         Paragraph(desc, s_body)],
    ]]
    t = Table(row, colWidths=[1.2*cm, 15.8*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (0,0), ROSA),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("ALIGN",         (0,0), (0,0), "CENTER"),
        ("BOX",           (0,0), (-1,-1), 0.5, HexColor("#FFCCE8")),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.15*cm))

story.append(Spacer(1, 0.8*cm))

# ════════════════════════ RODAPÉ ════════════════════════
story.append(HRFlowable(width="100%", thickness=1, color=ROSA_MED))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph(
    f"Feminnita Pijamas — Documento gerado em {datetime.now().strftime('%d/%m/%Y')}  |  "
    "github.com/feminnita/Feminnita-Marketing",
    ParagraphStyle("rodape", fontSize=8, fontName="Helvetica", textColor=CINZA_MED, alignment=TA_CENTER)))

# ─── Build ────────────────────────────────────────────────────────────────────
doc.build(story)
print("PDF gerado: ESTRATEGIA_FEMINNITA_2026.pdf")
