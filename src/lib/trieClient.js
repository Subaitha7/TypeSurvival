import Trie from "./trie/Trie";
import words from "./words.json";

let trie = new Trie();

trie.insertMany(words);

export default trie;