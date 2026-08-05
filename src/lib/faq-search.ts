/**
 * Ranking for the hero's FAQ field.
 *
 * Hand-rolled rather than Fuse.js or lunr, for three reasons that all point
 * the same way. The corpus is ~38 entries — an index costs more than a linear
 * scan over it. The site is a static export with a deliberately short
 * dependency list (it has dropped scroll and postprocessing libraries once
 * already), and a search library would be the largest thing in the hero
 * bundle. And a generic fuzzy matcher scores by string distance, which is the
 * wrong signal here: "cost" should rank the pricing answer top, and it only
 * does that if TAGS outweigh body text — a weighting a black-box scorer
 * won't give you.
 *
 * Scoring is field-weighted with a coverage bonus. The coverage term is what
 * makes multi-word queries behave: "database migration" should beat an entry
 * that matches "database" ten times over one that matches both words once.
 */

import { FAQ, type FaqEntry } from "@/content/faq";

export type Hit = {
  entry: FaqEntry;
  score: number;
  /** Tokens that actually matched, for highlighting. */
  matched: readonly string[];
};

/**
 * Dropped from queries, never from the corpus. These are the words that show
 * up in nearly every question ("how do I ...", "what is the ...") and so
 * carry no discriminating power — left in, they flatten the ranking toward
 * whichever entry happens to be wordiest.
 */
const STOP = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "does",
  "for", "from", "get", "have", "how", "i", "if", "in", "is", "it", "its", "me",
  "my", "of", "on", "or", "our", "that", "the", "then", "there", "this", "to",
  "us", "was", "we", "what", "when", "where", "which", "who", "why", "will",
  "with", "you", "your",
]);

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Crudest possible stemmer: drop a trailing plural "s".
 *
 * It exists because prefix matching is directional and quietly wrong without
 * it. A visitor types "who reviews the code"; the corpus says "review". Since
 * `"review".startsWith("reviews")` is false, the token misses every review
 * answer and the query lands on whichever entry happens to say "code" most —
 * which is the data-isolation one. One character of stemming fixes an entire
 * class of miss. Anything more (Porter, a real lemmatiser) is more machinery
 * than 38 hand-written questions can possibly justify.
 */
const stem = (w: string) =>
  w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;

function tokenize(q: string): string[] {
  const all = normalize(q).split(" ").filter(Boolean);
  const kept = all.filter((t) => !STOP.has(t));
  // "what is it" is all stopwords — searching nothing returns nothing, so
  // fall back to the raw tokens rather than showing an empty result.
  return (kept.length ? kept : all).map(stem);
}

/** Pre-normalized haystacks, built once at module load. */
const INDEX = FAQ.map((entry) => {
  const q = normalize(entry.q);
  const tags = entry.tags.map(normalize);
  return {
    entry,
    q,
    qStems: q.split(" ").filter(Boolean).map(stem),
    a: normalize(entry.a),
    tags,
    tagStems: tags.map((t) => t.split(" ").map(stem).join(" ")),
    category: normalize(entry.category),
    words: q.split(" ").filter(Boolean).length,
  };
});

export function searchFaq(query: string, limit = 6): Hit[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const phrase = normalize(query);
  const hits: Hit[] = [];

  for (let i = 0; i < INDEX.length; i++) {
    const row = INDEX[i];
    let score = 0;
    const matched = new Set<string>();

    // Whole-query phrase hits — the strongest signal there is, because it
    // means the user typed something close to how the question is worded.
    if (phrase.length > 2) {
      if (row.q.includes(phrase)) score += 60;
      else if (row.tags.some((t) => t.includes(phrase))) score += 40;
      else if (row.a.includes(phrase)) score += 14;
    }

    for (const token of tokens) {
      let hit = false;

      // Prefix beats substring: typing "sec" should reach "secrets" and
      // "security", not "consecutive".
      if (row.qStems.some((w) => w.startsWith(token))) {
        score += 15;
        hit = true;
      } else if (row.q.includes(token)) {
        score += 9;
        hit = true;
      }

      for (const tag of row.tagStems) {
        if (tag === token) {
          score += 13;
          hit = true;
          break;
        }
        if (tag.startsWith(token) || tag.includes(` ${token}`)) {
          score += 8;
          hit = true;
          break;
        }
      }

      if (row.category.includes(token)) {
        score += 7;
        hit = true;
      }

      if (row.a.includes(token)) {
        score += 3;
        hit = true;
      }

      if (hit) matched.add(token);
    }

    if (!matched.size) continue;

    // Coverage: reward entries that answer the WHOLE question. Without it a
    // single high-frequency word drags in everything it appears in.
    score += (matched.size / tokens.length) * 26;
    // Shorter questions that still match are usually the more direct answer.
    score += Math.max(0, 12 - row.words) * 0.4;

    hits.push({ entry: row.entry, score, matched: [...matched] });
  }

  return hits
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Splits `text` into alternating plain / matched runs for highlighting.
 * Returns `[{ text, hit }]` so the caller decides the markup — the search
 * layer has no business emitting `<mark>`.
 */
export function highlight(
  text: string,
  tokens: readonly string[],
): { text: string; hit: boolean }[] {
  if (!tokens.length) return [{ text, hit: false }];

  const escaped = tokens
    .filter((t) => t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  if (!escaped.length) return [{ text, hit: false }];

  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts: { text: string; hit: boolean }[] = [];
  let last = 0;

  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0;
    if (at > last) parts.push({ text: text.slice(last, at), hit: false });
    parts.push({ text: m[0], hit: true });
    last = at + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), hit: false });

  return parts;
}
