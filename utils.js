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

export const ensureArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

/**
 * Ensures all records have the same set of keys for consistent CSV output.
 * Adds any missing keys to each record with an empty string as the value.
 * This guarantees every row has all columns, preventing missing headers/columns
 * resulting in incomplete data in the CSV.
 * @param {Array} results - The raw scraped product data.
 * @returns {Array} - The normalized product data.
 */
export const normalizeResult = (results) => {
  const set = new Set();

  results.forEach((obj) => {
    Object.keys(obj).forEach((key) => set.add(key));
  });

  return results.map((obj) => {
    const normalized = {};
    set.forEach((key) => {
      normalized[key] = obj[key] || ""; //better for csv format as treated as blank cell
    });
    return normalized;
  });
};
