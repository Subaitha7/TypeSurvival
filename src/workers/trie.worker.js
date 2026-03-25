import Trie from "../lib/trie/Trie.js";
import words from "../lib/words.json";
import levenshtein from "../lib/levenshtein.js";

const trie = new Trie();
trie.insertMany(words);

const cache = {};

self.onmessage = function (event) {
  const { prefix, heatMode } = event.data;

  if (!prefix) {
    self.postMessage({ suggestions: [] });
    return;
  }

  let suggestions;

  // CACHE
  if (cache[prefix]) {
    suggestions = cache[prefix];
  } else {
    suggestions = trie.getSuggestions(prefix, 10); // get larger pool
    cache[prefix] = suggestions;
  }

  if (suggestions.length === 0) {
    self.postMessage({ suggestions: [] });
    return;
  }

  // NORMAL MODE
  if (!heatMode) {
    self.postMessage({ suggestions: [suggestions[0]] });
    return;
  }

  // HEAT MODE SMART SELECTION
  const base = suggestions[0];

  const filtered = suggestions.filter((word) => {
    if (word === base) return false;

    // avoid big length difference
    if (Math.abs(word.length - base.length) > 2) return false;

    const distance = levenshtein(base, word);

    return distance === 1 || distance === 2;
  });

  if (filtered.length > 0) {
    const random =
      filtered[Math.floor(Math.random() * filtered.length)];

    self.postMessage({ suggestions: [random] });
    return;
  }

  // fallback
  self.postMessage({ suggestions: [base] });
};