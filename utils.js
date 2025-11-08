export const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]+>/g, "") // remove tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export const extractPlainStrings = (html = "") => {
  if (!html) return [];
  // normalize separators for list-like content, then split
  const normalized = String(html)
    .replace(/<\/li>/gi, "|")
    .replace(/<li[^>]*>/gi, "|")
    .replace(/<br\s*\/?>/gi, "|")
    .replace(/<\/p>/gi, "|")
    .replace(/<\/div>/gi, "|");
  return normalized
    .split("|")
    .map((s) => stripHtml(s))
    .map((s) => s.trim())
    .filter(Boolean);
};
