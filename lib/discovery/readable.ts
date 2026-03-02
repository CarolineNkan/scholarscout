// lib/discovery/readable.ts
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export function htmlToReadableText(html: string, url: string) {
  const dom = new JSDOM(html, { url });

  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const title =
    (article?.title || dom.window.document.title || "").trim() || "Untitled";

  // Prefer Readability content if available; fallback to body text
  const textContent = article?.textContent?.trim()
    ? article.textContent.trim()
    : dom.window.document.body?.textContent?.replace(/\s+/g, " ").trim() || "";

  const excerpt =
    article?.excerpt?.trim() ||
    textContent.slice(0, 280).trim() ||
    undefined;

  return { title, textContent, excerpt };
}