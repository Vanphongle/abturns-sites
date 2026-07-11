// Minimal, safe Markdown → HTML for journal posts. ALL input is HTML-escaped
// first, then a small whitelist of Markdown is applied (##/### headings,
// paragraphs, - lists, **bold**, *italic*, [text](http…) links). No raw HTML
// ever passes through — posts are owner/AI content, but the renderer treats
// them as untrusted anyway.

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function inline(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

export function markdownToHtml(md: string): string {
  const lines = escapeHtml(md.replace(/\r\n/g, '\n')).split('\n')
  const out: string[] = []
  let list: string[] | null = null
  let para: string[] = []

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(' '))}</p>`)
      para = []
    }
  }
  const flushList = () => {
    if (list) {
      out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`)
      list = null
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const t = line.trim()
    if (!t) { flushPara(); flushList(); continue }
    const h3 = /^###\s+(.*)$/.exec(t)
    const h2 = /^##\s+(.*)$/.exec(t)
    const h1 = /^#\s+(.*)$/.exec(t)
    const li = /^[-*]\s+(.*)$/.exec(t)
    if (h3) { flushPara(); flushList(); out.push(`<h3>${inline(h3[1])}</h3>`); continue }
    if (h2 || h1) { flushPara(); flushList(); out.push(`<h2>${inline((h2 ?? h1)![1])}</h2>`); continue }
    if (li) { flushPara(); list = list ?? []; list.push(li[1]); continue }
    flushList()
    para.push(t)
  }
  flushPara()
  flushList()
  return out.join('\n')
}
