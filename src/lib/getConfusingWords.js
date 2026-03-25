function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j],     // delete
            dp[i][j - 1],     // insert
            dp[i - 1][j - 1]  // replace
          );
      }
    }
  }

  return dp[a.length][b.length];
}

export default function getConfusingWords(word, wordsList) {
  if (!word) return [];

  return wordsList
    .filter(
      (w) =>
        w !== word &&
        Math.abs(w.length - word.length) <= 2 &&
        w[0] === word[0]
    )
    .map((w) => ({
      word: w,
      score: levenshtein(word, w),
    }))
    .filter((item) => item.score > 0 && item.score <= 2)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => item.word);
}
