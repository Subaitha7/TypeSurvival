import TrieNode from "./TrieNode.js";

export default class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        if (!word || typeof word !== "string") return;

        let current = this.root;

        for (const char of word.toLowerCase()) {
            if (!/[a-z]/.test(char)) return;

            if (!current.children[char]) {
            current.children[char] = new TrieNode();
            }
            current = current.children[char];
        }

        current.isEnd = true;
    }


    insertMany(words) {
        for (const word of words) {
            this.insert(word);
        }
    }

    _findNode(prefix) {
        let current = this.root;

        for (const char of prefix) {
            if (!current.children[char]) {
            return null;
            }
            current = current.children[char];
        }

        return current;
    }

    _collectWords(node, prefix, results, limit) {
        if (results.length >= limit) return;

        if (node.isEnd) {
            results.push(prefix);
        }

        const chars = Object.keys(node.children).sort();

        for (const char of chars) {
            this._collectWords(
                node.children[char],
                prefix + char,
                results,
                limit
            );
        }

    }

    getSuggestions(prefix, limit = 5) {
        if (typeof prefix !== "string") return [];
        if (prefix.length === 0) return [];

        const results = [];
        const node = this._findNode(prefix.toLowerCase());

        if (!node) return results;

        this._collectWords(node, prefix.toLowerCase(), results, limit);
        return results;
    }



}
