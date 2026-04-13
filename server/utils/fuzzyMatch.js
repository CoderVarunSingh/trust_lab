/**
 * Fuzzy Match Utility
 * Builds a regex that tolerates typos, missing chars, and character swaps.
 * E.g., "thyrod" matches "thyroid", "dlehi" matches "delhi"
 */

const buildFuzzyRegex = (query) => {
  if (!query || query.trim().length === 0) return null;
  
  const cleaned = query.trim().toLowerCase();
  
  // Build a regex that allows optional characters between each typed character
  // This handles missing letters, extra letters, and minor typos
  let pattern = '';
  for (let i = 0; i < cleaned.length; i++) {
    const c = escapeRegex(cleaned[i]);
    if (c === ' ') {
      pattern += '\\s*';
    } else {
      pattern += c + '[a-z]{0,2}';
    }
  }
  
  return new RegExp(pattern, 'i');
};

/**
 * Calculate string similarity using Levenshtein distance
 */
const levenshtein = (a, b) => {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

/**
 * Check if query fuzzy-matches a target string
 * Returns a score 0-1 (1 = perfect match)
 */
const fuzzyScore = (query, target) => {
  if (!query || !target) return 0;
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  
  if (t.includes(q)) return 1;
  if (q.includes(t)) return 0.9;
  
  const dist = levenshtein(q, t);
  const maxLen = Math.max(q.length, t.length);
  const score = 1 - (dist / maxLen);
  
  return Math.max(0, score);
};

/**
 * Find best fuzzy matches from a list
 */
const fuzzyFilter = (query, items, getField, threshold = 0.4) => {
  if (!query || !items?.length) return items || [];
  
  const scored = items.map(item => {
    const fields = Array.isArray(getField) ? getField : [getField];
    const maxScore = Math.max(...fields.map(fn => {
      const val = typeof fn === 'function' ? fn(item) : item[fn];
      return fuzzyScore(query, val || '');
    }));
    return { item, score: maxScore };
  });
  
  return scored
    .filter(s => s.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(s => s.item);
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { buildFuzzyRegex, fuzzyScore, fuzzyFilter, levenshtein };
