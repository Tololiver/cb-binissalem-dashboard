// Netlify Function: descarga una página pública y devuelve su texto limpio.
// La usa el importador de ejercicios de Tololiver Dashboard: /.netlify/functions/fetch-url?url=...
const BLOCKED = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$)/i;

const decode = s => s
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));

function htmlToText(html) {
  return decode(
    html
      .replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*/g, "\n\n").trim();
}

export default async (req) => {
  const json = (body, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { "content-type": "application/json; charset=utf-8" },
  });
  const target = new URL(req.url).searchParams.get("url") || "";
  let u;
  try { u = new URL(target); } catch { return json({ error: "URL no válida" }, 400); }
  if (!/^https?:$/.test(u.protocol) || BLOCKED.test(u.hostname)) return json({ error: "URL no permitida" }, 400);

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(u.toString(), {
      signal: ctrl.signal, redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (TololiverDashboard importador)", "accept": "text/html,text/plain" },
    });
    clearTimeout(t);
    if (!r.ok) return json({ error: `La web ha respondido ${r.status}` }, 502);
    const type = r.headers.get("content-type") || "";
    if (!/text\/(html|plain)/.test(type)) return json({ error: `Tipo de contenido no soportado (${type || "desconocido"}). Si es un PDF, descárgalo y usa la pestaña PDF.` }, 415);
    const raw = (await r.text()).slice(0, 3_000_000);
    const title = decode((raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1]).trim();
    const text = type.includes("html") ? htmlToText(raw) : raw;
    return json({ title, url: u.toString(), text: text.slice(0, 150000) });
  } catch (e) {
    return json({ error: e.name === "AbortError" ? "La web ha tardado demasiado" : "No se ha podido descargar la página" }, 502);
  }
};
