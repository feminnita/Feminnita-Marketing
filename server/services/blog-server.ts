/**
 * Blog Server — Serve blog.feminnita.com.br diretamente do banco de dados
 * Rotas públicas (sem autenticação):
 *   GET /blog           → listagem de posts publicados
 *   GET /blog/:slug     → post individual
 *   GET /blog/feed.xml  → RSS feed
 */

import type { Application } from "express";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

// ─── Markdown → HTML ──────────────────────────────────────────────────────────

function mdToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[a-z])/gm, "")
    .replace(/^(.+)$/gm, (line) => (line.match(/^<[a-z]/) ? line : `<p>${line}</p>`));
}

function readingTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDateShort(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Categoria ────────────────────────────────────────────────────────────────

const CAT_MAP: Record<string, { icon: string; tag: string }> = {
  "Moda & Estilo":      { icon: "fa-solid fa-star",     tag: "tag--moda" },
  "Tendências":         { icon: "fa-solid fa-fire",     tag: "tag--tendencias" },
  "Cuidados & Dicas":   { icon: "fa-solid fa-leaf",     tag: "tag--dicas" },
  "Tecidos & Produtos": { icon: "fa-solid fa-scissors", tag: "tag--tecidos" },
  "Comunidade":         { icon: "fa-solid fa-heart",    tag: "tag--comunidade" },
  "Treinamento":        { icon: "fa-solid fa-briefcase",tag: "tag--negocios" },
};

function catInfo(cat: string | null) {
  return CAT_MAP[cat ?? ""] ?? { icon: "fa-solid fa-pen", tag: "tag--moda" };
}

// ─── Layout HTML ─────────────────────────────────────────────────────────────

function layout(opts: {
  title: string;
  description?: string;
  ogImage?: string;
  body: string;
  canonical?: string;
}): string {
  const { title, description = "", ogImage = "", body, canonical = "https://blog.feminnita.com.br" } = opts;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${description.replace(/"/g, "&quot;")}" />
  <title>${title.replace(/"/g, "&quot;")}</title>
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👗</text></svg>" />
  <link rel="stylesheet" href="/blog-style.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" />
  <link rel="alternate" type="application/rss+xml" title="Blog Feminnita" href="/blog/feed.xml" />
  ${ogImage ? `<meta property="og:image" content="${ogImage}" />` : ""}
  <meta property="og:title" content="${title.replace(/"/g, "&quot;")}" />
  <meta property="og:description" content="${description.replace(/"/g, "&quot;")}" />
  <meta property="og:type" content="website" />
</head>
<body>
  <nav class="navbar" role="navigation" aria-label="Menu principal">
    <div class="container navbar__inner">
      <a href="/blog" class="navbar__logo">Feminn<span>ita</span>
        <span class="navbar__logo-sub">BLOG</span>
      </a>
      <ul class="navbar__menu" id="navMenu" role="list">
        <li><a href="/blog" class="navbar__link">Início</a></li>
        <li><a href="/blog?cat=treinamento" class="navbar__link">Treinamento</a></li>
        <li><a href="/blog?cat=comunidade" class="navbar__link">Comunidade</a></li>
        <li><a href="/blog?cat=tecidos" class="navbar__link">Tecidos</a></li>
        <li><a href="https://www.feminnita.com.br" target="_blank" rel="noopener" class="navbar__cta">Comprar no Atacado &rarr;</a></li>
      </ul>
      <button class="navbar__hamburger" id="hamburger" aria-label="Abrir menu" aria-expanded="false" aria-controls="navMenu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  ${body}

  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="/blog" class="footer__logo">Feminn<span>ita</span> <span class="footer__logo-sub">BLOG</span></a>
          <p class="footer__desc">Conteúdo exclusivo para revendedoras e amantes da moda íntima.</p>
        </div>
        <div>
          <h4 class="footer__titulo-coluna">Blog</h4>
          <ul class="footer__links" role="list">
            <li><a href="/blog" class="footer__link">Início</a></li>
            <li><a href="/blog?cat=treinamento" class="footer__link">Treinamento</a></li>
            <li><a href="/blog?cat=comunidade" class="footer__link">Comunidade</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer__titulo-coluna">Feminnita</h4>
          <ul class="footer__links" role="list">
            <li><a href="https://www.feminnita.com.br" target="_blank" rel="noopener" class="footer__link">Comprar no Atacado</a></li>
            <li><a href="https://www.feminnita.com.br" target="_blank" rel="noopener" class="footer__link">Ver Catálogo</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p class="footer__copy">&copy; ${new Date().getFullYear()} Feminnita &middot; Nova Friburgo, RJ &middot; <a href="https://www.feminnita.com.br" target="_blank" rel="noopener">www.feminnita.com.br</a></p>
      </div>
    </div>
  </footer>

  <script>
    // Hamburger menu
    const ham = document.getElementById("hamburger");
    const menu = document.getElementById("navMenu");
    if (ham && menu) {
      ham.addEventListener("click", () => {
        const open = ham.getAttribute("aria-expanded") === "true";
        ham.setAttribute("aria-expanded", String(!open));
        menu.classList.toggle("aberto", !open);
      });
    }

    // Category filter
    document.querySelectorAll(".filtro-ed").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filtro-ed").forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        const cat = btn.getAttribute("data-cat");
        document.querySelectorAll(".editorial-card").forEach(card => {
          if (!cat || cat === "todos") {
            card.style.display = "";
          } else {
            const cardCat = card.getAttribute("data-cat") || "";
            card.style.display = cardCat.includes(cat) ? "" : "none";
          }
        });
      });
    });

    // Reveal cards on scroll
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visivel"); });
    }, { threshold: 0.05 });
    document.querySelectorAll(".editorial-card").forEach(c => observer.observe(c));
  </script>
</body>
</html>`;
}

// ─── Página de listagem ───────────────────────────────────────────────────────

function renderPostCard(post: any): string {
  const ci = catInfo(post.category);
  const cat = (post.category ?? "").toLowerCase().replace(/\s/g, "-");
  const cover = post.coverImageUrl
    ? `<img src="${post.coverImageUrl}" alt="${post.title}" loading="lazy" onerror="this.style.display='none'" />`
    : "";
  return `
  <article class="editorial-card visivel" data-cat="${cat}" role="listitem">
    ${cover}
    <div class="editorial-card__ov"></div>
    <div class="editorial-card__body">
      <span class="editorial-card__tag ${ci.tag}">
        <i class="${ci.icon}" aria-hidden="true"></i> ${post.category ?? ""}
      </span>
      <h3 class="editorial-card__titulo">
        <a href="/blog/${post.slug}" style="color:inherit;text-decoration:none;">${post.title}</a>
      </h3>
      <p class="editorial-card__resumo">${post.excerpt ?? ""}</p>
      <div class="editorial-card__meta">
        <span>Equipe Feminnita</span>
        <span class="editorial-card__meta-sep">·</span>
        <span>${fmtDateShort(post.publishedAt)}</span>
        <span class="editorial-card__meta-sep">·</span>
        <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${readingTime(post.content)} min</span>
      </div>
      <a href="/blog/${post.slug}" class="editorial-card__ler">
        Ler artigo <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </a>
    </div>
  </article>`;
}

function renderListPage(posts: any[]): string {
  const cards = posts.map(renderPostCard).join("\n");
  const categories = ["todos", ...Array.from(new Set(posts.map(p => (p.category ?? "").toLowerCase().replace(/\s/g, "-"))))];

  const filterBtns = [
    { key: "todos", label: "Todos os artigos" },
    { key: "treinamento", label: "Treinamento" },
    { key: "comunidade", label: "Comunidade" },
    { key: "tecidos-&-produtos", label: "Tecidos" },
    { key: "cuidados-&-dicas", label: "Bem-estar" },
    { key: "moda-&-estilo", label: "Moda" },
    { key: "datas-especiais", label: "Datas Especiais" },
  ].filter(f => f.key === "todos" || categories.includes(f.key));

  const filters = filterBtns.map((f, i) =>
    `<button class="filtro-ed${i === 0 ? " ativo" : ""}" data-cat="${f.key}">${f.label}</button>`
  ).join("\n");

  const body = `
  <div style="margin-top:68px;">
    <div class="filtros-editorial">
      <div class="filtros-editorial__inner container">
        ${filters}
      </div>
    </div>

    <section class="editorial-wrapper">
      <div class="editorial-sep container">
        <span class="linha-dourada" style="height:1px;flex:1;background:rgba(212,169,86,0.25);"></span>
        <span style="font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#999;padding:0 1rem;">
          ${posts.length} artigo${posts.length !== 1 ? "s" : ""}
        </span>
        <span class="linha-dourada" style="height:1px;flex:1;background:rgba(212,169,86,0.25);"></span>
      </div>
      <div class="editorial-grid container">
        ${cards || '<p style="padding:3rem;text-align:center;color:#999;">Nenhum artigo publicado ainda.</p>'}
      </div>
    </section>

    <!-- Sala de arquivos CTA -->
    <section style="padding:4rem 1rem;background:var(--pessego);">
      <div class="container" style="max-width:640px;margin:0 auto;text-align:center;">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--borgonha);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
          <i class="fa-solid fa-folder-open" style="color:#fff;font-size:1.5rem;" aria-hidden="true"></i>
        </div>
        <h2 style="font-size:1.75rem;font-weight:800;color:var(--borgonha);margin-bottom:0.75rem;">Acesse a Sala de Arquivos</h2>
        <p style="color:#666;line-height:1.7;margin-bottom:2rem;">
          Fotos profissionais, banners prontos, lookbook da coleção, planilhas de precificação e scripts de vendas — tudo que você precisa para trabalhar com a Feminnita.
        </p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
          <a href="/portal/solicitar-acesso" class="btn btn-borgonha">
            <i class="fa-solid fa-lock" aria-hidden="true"></i> Solicitar acesso
          </a>
          <a href="/portal/login" class="btn btn-outline-borgonha">
            <i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i> Já tenho acesso
          </a>
        </div>
        <p style="font-size:0.8rem;color:#aaa;margin-top:1.5rem;">Para liberar o acesso, você precisa ter realizado uma compra, curtido a nossa postagem e deixado sua avaliação na loja.</p>
      </div>
    </section>
  </div>`;

  return layout({
    title: "Blog Feminnita — Dicas, Treinamento e Comunidade para Revendedoras",
    description: "Conteúdo exclusivo para revendedoras de pijamas e moda íntima. Treinamentos, histórias de sucesso e dicas para vender mais.",
    body,
    canonical: "https://blog.feminnita.com.br",
  });
}

// ─── Página de artigo ─────────────────────────────────────────────────────────

function renderPostPage(post: any): string {
  const ci = catInfo(post.category);
  const mins = readingTime(post.content);
  const bodyHtml = mdToHtml(post.content);
  const cover = post.coverImageUrl
    ? `<img src="${post.coverImageUrl}" alt="${post.title}" style="width:100%;border-radius:12px;margin:2rem 0;object-fit:cover;max-height:480px;" />`
    : "";

  const body = `
  <div style="background:#fff;border-bottom:1px solid rgba(212,169,86,0.15);margin-top:68px;">
    <div class="container">
      <nav class="breadcrumb" aria-label="Caminho da página">
        <a href="/blog">Início</a><span aria-hidden="true">›</span>
        <a href="/blog?cat=${(post.category ?? "").toLowerCase().replace(/\s/g, "-")}">${post.category ?? "Blog"}</a><span aria-hidden="true">›</span>
        <span aria-current="page">${post.title}</span>
      </nav>
    </div>
  </div>

  <main class="artigo-layout">
    <div class="container">
      <div class="artigo-layout__inner">
        <article>
          <header class="artigo-conteudo__header">
            <span class="card-artigo__tag ${ci.tag}" style="margin-bottom:1rem;">
              <i class="${ci.icon}" aria-hidden="true"></i> ${post.category ?? ""}
            </span>
            <h1>${post.title}</h1>
            <p class="editorial" style="color:#666;margin-bottom:1.5rem;">${post.excerpt ?? ""}</p>
            <span class="linha-dourada"></span>
            <div class="artigo-conteudo__meta">
              <div class="avatar" aria-hidden="true">F</div>
              <div>
                <strong style="font-size:0.9rem;color:var(--preto-quente);">Equipe Feminnita</strong>
                <span class="label" style="display:block;color:#aaa;">Marketing &amp; Conteúdo · Feminnita</span>
              </div>
              <span style="color:#ddd;margin:0 0.25rem;">|</span>
              <span style="font-size:0.8125rem;color:#888;">
                <i class="fa-regular fa-calendar" aria-hidden="true"></i> ${fmtDate(post.publishedAt)}
              </span>
              <span style="color:#ddd;margin:0 0.25rem;">|</span>
              <span style="font-size:0.8125rem;color:#888;">
                <i class="fa-regular fa-clock" aria-hidden="true"></i> ${mins} min de leitura
              </span>
            </div>
          </header>

          ${cover}

          <div class="artigo-conteudo__corpo">
            ${bodyHtml}

            <div style="background:linear-gradient(135deg,var(--borgonha),var(--borgonha-escuro));color:#fff;padding:2rem;border-radius:12px;margin:2.5rem 0;text-align:center;">
              <h3 style="color:var(--champagne);margin-bottom:0.75rem;">Gostou do conteúdo?</h3>
              <p style="margin-bottom:1.5rem;opacity:0.9;">Conheça os produtos Feminnita e leve qualidade para suas clientes.</p>
              <a href="https://www.feminnita.com.br" target="_blank" rel="noopener" class="btn btn-dourado">
                <i class="fa-solid fa-handshake" aria-hidden="true"></i> Quero ser revendedora
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </main>`;

  return layout({
    title: `${post.seoTitle ?? post.title} — Blog Feminnita`,
    description: post.seoDescription ?? post.excerpt ?? "",
    ogImage: post.coverImageUrl ?? "",
    body,
    canonical: `https://blog.feminnita.com.br/blog/${post.slug}`,
  });
}

// ─── RSS Feed ─────────────────────────────────────────────────────────────────

function renderRss(posts: any[]): string {
  const items = posts.slice(0, 20).map(p => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>https://blog.feminnita.com.br/blog/${p.slug}</link>
      <description><![CDATA[${p.excerpt ?? ""}]]></description>
      <pubDate>${new Date(p.publishedAt ?? p.createdAt).toUTCString()}</pubDate>
      <guid>https://blog.feminnita.com.br/blog/${p.slug}</guid>
    </item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Feminnita</title>
    <link>https://blog.feminnita.com.br</link>
    <description>Dicas, treinamento e comunidade para revendedoras de pijamas</description>
    <language>pt-BR</language>
    <atom:link href="https://blog.feminnita.com.br/blog/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

// ─── Registro de rotas ────────────────────────────────────────────────────────

export function registerBlogRoutes(app: Application) {
  // RSS
  app.get("/blog/feed.xml", async (_req, res) => {
    try {
      const db = await getDb();
      if (!db) return res.status(503).send("Banco indisponível");
      const posts = await db.select().from(blogPosts)
        .where(eq(blogPosts.status, "published"))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(20);
      res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
      res.send(renderRss(posts));
    } catch (e: any) {
      res.status(500).send("Erro ao gerar feed");
    }
  });

  // Post individual
  app.get("/blog/:slug", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) return res.status(503).send("Banco indisponível");
      const [post] = await db.select().from(blogPosts)
        .where(and(eq(blogPosts.slug, req.params.slug), eq(blogPosts.status, "published")))
        .limit(1);
      if (!post) return res.status(404).send(layout({
        title: "Artigo não encontrado — Blog Feminnita",
        body: `<div style="margin-top:120px;text-align:center;padding:4rem 1rem;">
          <h1 style="color:var(--borgonha)">Artigo não encontrado</h1>
          <p style="color:#666;margin:1rem 0 2rem">O artigo que você procura não existe ou foi removido.</p>
          <a href="/blog" class="btn btn-borgonha">← Voltar ao blog</a>
        </div>`,
      }));
      res.send(renderPostPage(post));
    } catch (e: any) {
      res.status(500).send("Erro ao carregar artigo");
    }
  });

  // Listagem (homepage do blog)
  app.get("/blog", async (_req, res) => {
    try {
      const db = await getDb();
      if (!db) return res.status(503).send("Banco indisponível");
      const posts = await db.select().from(blogPosts)
        .where(eq(blogPosts.status, "published"))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(50);
      res.send(renderListPage(posts));
    } catch (e: any) {
      res.status(500).send("Erro ao carregar blog");
    }
  });

  console.log("[Blog] Rotas públicas registradas: GET /blog, GET /blog/:slug, GET /blog/feed.xml");
}
