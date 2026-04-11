/**
 * Blog Publisher — Publica posts do painel direto no blog.feminnita.com.br
 *
 * Fluxo: Gerar HTML → Push no GitHub (feminnita/blog-feminnita) → Netlify deploya
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO  = process.env.GITHUB_BLOG_REPO || "feminnita/blog-feminnita";
const GITHUB_BRANCH = process.env.GITHUB_BLOG_BRANCH || "main";
const API = `https://api.github.com/repos/${GITHUB_REPO}/contents`;

// ─── Markdown → HTML simples ─────────────────────────────────────────────────

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^\*\*\*(.+)\*\*\*$/gm, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:4px solid var(--champagne);padding:1rem 1.5rem;background:var(--pessego);border-radius:0 8px 8px 0;margin:2rem 0;font-style:italic;color:var(--preto-quente);">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul style="margin:1rem 0 1rem 1.5rem;">${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[a-z])/gm, '')
    .replace(/^(.+)$/gm, (line) => {
      if (line.match(/^<[a-z]/)) return line;
      return `<p>${line}</p>`;
    });
}

// ─── Calcular tempo de leitura ───────────────────────────────────────────────

function readingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Formatar data em português ──────────────────────────────────────────────

function fmtDataPtBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Categoria → ícone e tag CSS ─────────────────────────────────────────────

const CATEGORY_MAP: Record<string, { icon: string; tag: string; label: string }> = {
  "Moda & Estilo":      { icon: "fa-solid fa-star", tag: "tag--moda", label: "Moda & Estilo" },
  "Tendências":         { icon: "fa-solid fa-fire", tag: "tag--tendencias", label: "Tendências" },
  "Cuidados & Dicas":   { icon: "fa-solid fa-leaf", tag: "tag--dicas", label: "Cuidados & Dicas" },
  "Tecidos & Produtos": { icon: "fa-solid fa-scissors", tag: "tag--tecidos", label: "Tecidos & Produtos" },
  "Comunidade":         { icon: "fa-solid fa-heart", tag: "tag--comunidade", label: "Comunidade" },
  "Negócios":           { icon: "fa-solid fa-briefcase", tag: "tag--negocios", label: "Negócios" },
};

function getCategoryInfo(category: string) {
  return CATEGORY_MAP[category] ?? { icon: "fa-solid fa-pen", tag: "tag--moda", label: category };
}

// ─── Gerar HTML do artigo ────────────────────────────────────────────────────

export interface ArticleData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  seoTitle?: string;
  seoDescription?: string;
  category?: string;
  coverImageUrl?: string;
  publishedAt?: Date;
}

export function generateArticleHtml(data: ArticleData): string {
  const date = data.publishedAt ?? new Date();
  const catInfo = getCategoryInfo(data.category ?? "Moda & Estilo");
  const mins = readingTime(data.content);
  const bodyHtml = markdownToHtml(data.content);
  const seoTitle = data.seoTitle ?? `${data.title} — Blog Feminnita`;
  const seoDesc = data.seoDescription ?? data.excerpt;
  const coverImg = data.coverImageUrl
    ? `<div class="artigo-conteudo__capa">
        <img src="${data.coverImageUrl}" alt="${data.title}" style="width:100%;border-radius:12px;margin:2rem 0;object-fit:cover;max-height:480px;" />
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${seoDesc.replace(/"/g, "&quot;")}" />
  <title>${seoTitle.replace(/"/g, "&quot;")}</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👗</text></svg>" />
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <meta property="og:title" content="${seoTitle.replace(/"/g, "&quot;")}" />
  <meta property="og:description" content="${seoDesc.replace(/"/g, "&quot;")}" />
  <meta property="og:type" content="article" />
  ${data.coverImageUrl ? `<meta property="og:image" content="${data.coverImageUrl}" />` : ""}
</head>
<body>

  <nav class="navbar" role="navigation" aria-label="Menu principal">
    <div class="container navbar__inner">
      <a href="index.html" class="navbar__logo">Feminn<span>ita</span>
        <span class="navbar__logo-sub">BLOG</span>
      </a>
      <ul class="navbar__menu" id="navMenu" role="list">
        <li><a href="index.html" class="navbar__link">Início</a></li>
        <li><a href="artigos.html" class="navbar__link">Artigos</a></li>
        <li><a href="treinamento.html" class="navbar__link">Treinamento</a></li>
        <li><a href="comunidade.html" class="navbar__link">Comunidade</a></li>
        <li><a href="sobre.html" class="navbar__link">Sobre</a></li>
        <li><a href="https://www.feminnita.com.br" target="_blank" rel="noopener" class="navbar__cta">Comprar no Atacado &rarr;</a></li>
      </ul>
      <button class="navbar__hamburger" id="hamburger" aria-label="Abrir menu" aria-expanded="false" aria-controls="navMenu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div style="background:#fff;border-bottom:1px solid rgba(212,169,86,0.15);margin-top:68px;">
    <div class="container">
      <nav class="breadcrumb" aria-label="Caminho da página">
        <a href="index.html">Início</a><span aria-hidden="true">›</span>
        <a href="artigos.html">${catInfo.label}</a><span aria-hidden="true">›</span>
        <span aria-current="page">${data.title}</span>
      </nav>
    </div>
  </div>

  <main class="artigo-layout">
    <div class="container">
      <div class="artigo-layout__inner">
        <article>
          <header class="artigo-conteudo__header">
            <span class="card-artigo__tag ${catInfo.tag}" style="margin-bottom:1rem;">
              <i class="${catInfo.icon}" aria-hidden="true"></i> ${catInfo.label}
            </span>
            <h1>${data.title}</h1>
            <p class="editorial" style="color:#666;margin-bottom:1.5rem;">${data.excerpt}</p>
            <span class="linha-dourada"></span>
            <div class="artigo-conteudo__meta">
              <div class="avatar" aria-hidden="true">F</div>
              <div>
                <strong style="font-size:0.9rem;color:var(--preto-quente);">Equipe Feminnita</strong>
                <span class="label" style="display:block;color:#aaa;">Marketing &amp; Conteúdo · Feminnita</span>
              </div>
              <span style="color:#ddd;margin:0 0.25rem;">|</span>
              <span style="font-size:0.8125rem;color:#888;">
                <i class="fa-regular fa-calendar" aria-hidden="true"></i> ${fmtDataPtBR(date)}
              </span>
              <span style="color:#ddd;margin:0 0.25rem;">|</span>
              <span style="font-size:0.8125rem;color:#888;">
                <i class="fa-regular fa-clock" aria-hidden="true"></i> ${mins} min de leitura
              </span>
            </div>
          </header>

          ${coverImg}

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
  </main>

  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="index.html" class="footer__logo">Feminn<span>ita</span> <span class="footer__logo-sub">BLOG</span></a>
          <p class="footer__desc">Conteúdo exclusivo para revendedoras e amantes da moda íntima.</p>
        </div>
        <div>
          <h4 class="footer__titulo-coluna">Blog</h4>
          <ul class="footer__links" role="list">
            <li><a href="index.html" class="footer__link">Início</a></li>
            <li><a href="artigos.html" class="footer__link">Artigos</a></li>
            <li><a href="treinamento.html" class="footer__link">Treinamento</a></li>
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
        <p class="footer__copy">&copy; 2026 Feminnita &middot; Nova Friburgo, RJ &middot; <a href="https://www.feminnita.com.br" target="_blank" rel="noopener">www.feminnita.com.br</a></p>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;
}

// ─── GitHub API ───────────────────────────────────────────────────────────────

async function githubRequest(path: string, method: string, body?: object) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${err}`);
  }
  return res.json();
}

async function getFileSha(path: string): Promise<string | null> {
  try {
    const data = await githubRequest(`/${path}`, "GET");
    return data.sha ?? null;
  } catch {
    return null;
  }
}

async function pushFile(path: string, content: string, message: string) {
  const sha = await getFileSha(path);
  const encoded = Buffer.from(content, "utf-8").toString("base64");
  const body: any = {
    message,
    content: encoded,
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;
  return githubRequest(`/${path}`, "PUT", body);
}

// ─── Atualizar artigos.html com novo card ────────────────────────────────────

async function addCardToArtigosPage(article: ArticleData, filename: string) {
  const catInfo = getCategoryInfo(article.category ?? "Moda & Estilo");
  const date = article.publishedAt ?? new Date();
  const mins = readingTime(article.content);
  const dateStr = date.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });

  const newCard = `
      <!-- ── ${article.title} (gerado automaticamente) ─── -->
      <article class="editorial-card" data-cat="${(article.category ?? "").toLowerCase().replace(/\s/g, "-")}" role="listitem">
        ${article.coverImageUrl ? `<img src="${article.coverImageUrl}" alt="${article.title}" loading="lazy" onerror="this.style.display='none'" />` : ""}
        <div class="editorial-card__ov"></div>
        <div class="editorial-card__body">
          <span class="editorial-card__tag ${catInfo.tag}">
            <i class="${catInfo.icon}" aria-hidden="true"></i> ${catInfo.label}
          </span>
          <h3 class="editorial-card__titulo">
            <a href="${filename}" style="color:inherit;text-decoration:none;">${article.title}</a>
          </h3>
          <p class="editorial-card__resumo">${article.excerpt}</p>
          <div class="editorial-card__meta">
            <span>Equipe Feminnita</span>
            <span class="editorial-card__meta-sep">·</span>
            <span>${dateStr}</span>
            <span class="editorial-card__meta-sep">·</span>
            <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${mins} min</span>
          </div>
          <a href="${filename}" class="editorial-card__ler">
            Ler artigo <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </article>`;

  // Buscar artigos.html atual
  const fileData = await githubRequest("/artigos.html", "GET");
  const currentContent = Buffer.from(fileData.content, "base64").toString("utf-8");

  // Inserir novo card logo após o <div class="editorial-grid"
  const insertMarker = '<div class="editorial-grid"';
  const insertIdx = currentContent.indexOf(insertMarker);
  if (insertIdx === -1) throw new Error("Não encontrei o marcador editorial-grid em artigos.html");

  const afterMarker = currentContent.indexOf(">", insertIdx) + 1;
  const updatedContent =
    currentContent.slice(0, afterMarker) +
    newCard +
    currentContent.slice(afterMarker);

  await pushFile("artigos.html", updatedContent, `blog: adicionar artigo "${article.title}"`);
}

// ─── Publicar artigo completo ─────────────────────────────────────────────────

export async function publishArticleToBlog(article: ArticleData): Promise<string> {
  if (!GITHUB_TOKEN || GITHUB_TOKEN === "seu_github_token_aqui") {
    throw new Error("GITHUB_TOKEN não configurado. Adicione no .env do VPS.");
  }

  const filename = `artigo-${article.slug}.html`;
  const html = generateArticleHtml(article);

  // 1. Push do arquivo do artigo
  await pushFile(filename, html, `blog: publicar "${article.title}"`);

  // 2. Atualizar artigos.html com o card
  try {
    await addCardToArtigosPage(article, filename);
  } catch (e: any) {
    console.warn("[BlogPublisher] Não foi possível atualizar artigos.html:", e.message);
  }

  return `https://blog.feminnita.com.br/${filename}`;
}
