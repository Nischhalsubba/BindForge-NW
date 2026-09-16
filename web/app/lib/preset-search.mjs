const TOKEN_ALIASES = new Map([
  ["ani", ["animation"]],
  ["anim", ["animation"]],
  ["barb", ["barbarian"]],
  ["canceling", ["cancel"]],
  ["cancelling", ["cancel"]],
  ["cancelled", ["cancel"]],
  ["heals", ["heal", "healer"]],
  ["healing", ["heal", "healer"]],
  ["healer", ["heal"]],
  ["invoke", ["invocation"]],
  ["lmb", ["lbutton", "left", "click"]],
  ["mmb", ["mbutton", "middle", "click"]],
  ["mouse", ["lbutton", "rbutton", "mbutton"]],
  ["rmb", ["rbutton", "right", "click"]],
  ["teammate", ["party", "ally", "player"]],
  ["teammates", ["party", "allies", "players"]],
]);

const FIELD_WEIGHTS = {
  title: 10,
  searchTerms: 9,
  className: 8,
  type: 8,
  plainEnglish: 4,
  command: 3,
};

function splitCamelCase(value) {
  return String(value ?? "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

export function normalizeSearchText(value) {
  return splitCamelCase(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_/\\|]+/g, " ")
    .replace(/[-–—]+/g, " ")
    .replace(/[^a-z0-9+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function queryAlternatives(token) {
  return [token, ...(TOKEN_ALIASES.get(token) ?? [])];
}

function editDistance(left, right) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = new Array(right.length + 1).fill(0);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      current[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        substitution,
      );
    }
    for (let index = 0; index < current.length; index += 1) previous[index] = current[index];
  }
  return previous[right.length];
}

function tokenSimilarity(queryToken, candidateToken) {
  if (queryToken === candidateToken) return 1;
  if (queryToken.length >= 3 && (candidateToken.startsWith(queryToken) || queryToken.startsWith(candidateToken))) return 0.88;
  const longest = Math.max(queryToken.length, candidateToken.length);
  if (longest < 4) return 0;
  const distance = editDistance(queryToken, candidateToken);
  const allowedDistance = longest >= 7 ? 2 : 1;
  if (distance > allowedDistance) return 0;
  return Math.max(0.55, 1 - distance / longest);
}

function fieldData(preset) {
  return [
    { name: "title", value: preset.title },
    { name: "searchTerms", value: Array.isArray(preset.searchTerms) ? preset.searchTerms.join(" ") : "" },
    { name: "className", value: preset.className },
    { name: "type", value: preset.type },
    { name: "plainEnglish", value: preset.plainEnglish },
    { name: "command", value: preset.command },
  ].map((field) => ({
    ...field,
    normalized: normalizeSearchText(field.value),
    tokens: tokenize(field.value),
    weight: FIELD_WEIGHTS[field.name],
  }));
}

function bestTokenScore(queryToken, fields) {
  let best = 0;
  for (const alternative of queryAlternatives(queryToken)) {
    for (const field of fields) {
      for (const candidate of field.tokens) {
        const similarity = tokenSimilarity(alternative, candidate);
        if (!similarity) continue;
        const score = field.weight * similarity;
        if (score > best) best = score;
      }
    }
  }
  return best;
}

export function scorePresetSearch(preset, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 1;
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return 1;
  const fields = fieldData(preset);
  let score = 0;
  for (const token of queryTokens) {
    const tokenScore = bestTokenScore(token, fields);
    if (!tokenScore) return 0;
    score += tokenScore;
  }

  const title = fields.find((field) => field.name === "title")?.normalized ?? "";
  const searchTerms = fields.find((field) => field.name === "searchTerms")?.normalized ?? "";
  const className = fields.find((field) => field.name === "className")?.normalized ?? "";
  const type = fields.find((field) => field.name === "type")?.normalized ?? "";
  const command = fields.find((field) => field.name === "command")?.normalized ?? "";

  if (title === normalizedQuery) score += 120;
  else if (title.startsWith(normalizedQuery)) score += 80;
  else if (title.includes(normalizedQuery)) score += 55;
  if (searchTerms.includes(normalizedQuery)) score += 45;
  if (className.includes(normalizedQuery)) score += 36;
  if (type.includes(normalizedQuery)) score += 36;
  if (command.includes(normalizedQuery)) score += 22;
  return score;
}

export function searchHighlightTerms(query) {
  const terms = [];
  for (const token of tokenize(query)) {
    terms.push(token, ...queryAlternatives(token));
  }
  return Array.from(new Set(terms.filter((term) => term.length >= 2))).sort((left, right) => right.length - left.length);
}

function candidateSimilarity(queryTokens, label) {
  const candidateTokens = tokenize(label);
  if (!candidateTokens.length) return 0;
  let total = 0;
  for (const queryToken of queryTokens) {
    let best = 0;
    for (const alternative of queryAlternatives(queryToken)) {
      for (const candidateToken of candidateTokens) best = Math.max(best, tokenSimilarity(alternative, candidateToken));
    }
    total += best;
  }
  return total / Math.max(1, queryTokens.length);
}

export function suggestPresetSearches(presets, query, limit = 3) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];
  const broad = new Set();
  const titles = new Set();
  for (const preset of presets) {
    if (preset.type) broad.add(preset.type);
    if (preset.className && preset.className !== "Any Class") broad.add(preset.className);
    if (preset.title) titles.add(preset.title);
  }
  const normalizedQuery = normalizeSearchText(query);
  const candidates = [
    ...Array.from(broad, (label) => ({ label, broad: true })),
    ...Array.from(titles, (label) => ({ label, broad: false })),
  ]
    .filter(({ label }) => normalizeSearchText(label) !== normalizedQuery)
    .map((candidate) => ({ ...candidate, similarity: candidateSimilarity(queryTokens, candidate.label) }))
    .filter((candidate) => candidate.similarity >= 0.5)
    .sort((left, right) => right.similarity - left.similarity || Number(right.broad) - Number(left.broad) || left.label.localeCompare(right.label));

  const selected = [];
  for (const candidate of candidates) {
    if (selected.includes(candidate.label)) continue;
    selected.push(candidate.label);
    if (selected.length >= limit) return selected;
  }

  const fallbacks = ["Animation Cancel", "Targeting", "VIP Services", "Combat", "Utility"]
    .filter((label) => broad.has(label) && !selected.includes(label));
  return [...selected, ...fallbacks].slice(0, limit);
}
