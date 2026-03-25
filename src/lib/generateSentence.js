import words from "./words.json";

export default function generateSentence(length = 10, difficulty = "medium") {
  let filteredWords = words;

  if (difficulty === "easy") {
    filteredWords = words.filter((w) => w.length <= 4);
  }

  if (difficulty === "medium") {
    filteredWords = words.filter((w) => w.length > 4 && w.length <= 7);
  }

  if (difficulty === "hard") {
    filteredWords = words.filter((w) => w.length > 7);
  }

  const sentence = [];
  const used = new Set();

  while (sentence.length < length) {
    const word =
      filteredWords[Math.floor(Math.random() * filteredWords.length)];

    if (!used.has(word)) {
      sentence.push(word);
      used.add(word);
    }
  }

  return sentence;
}
