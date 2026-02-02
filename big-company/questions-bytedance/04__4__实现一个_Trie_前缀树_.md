# 4. 实现一个 Trie（前缀树）

**答案：**

```javascript
// Trie 节点
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.count = 0; // 记录经过该节点的单词数
  }
}

// Trie 实现
class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  
  // 插入单词
  insert(word) {
    let node = this.root;
    
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
      node.count++;
    }
    
    node.isEnd = true;
  }
  
  // 搜索单词
  search(word) {
    let node = this.root;
    
    for (const char of word) {
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    
    return node.isEnd;
  }
  
  // 搜索前缀
  startsWith(prefix) {
    let node = this.root;
    
    for (const char of prefix) {
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    
    return true;
  }
  
  // 删除单词
  delete(word) {
    return this._deleteHelper(this.root, word, 0);
  }
  
  _deleteHelper(node, word, index) {
    if (index === word.length) {
      if (!node.isEnd) {
        return false;
      }
      node.isEnd = false;
      return Object.keys(node.children).length === 0;
    }
    
    const char = word[index];
    if (!node.children[char]) {
      return false;
    }
    
    const shouldDelete = this._deleteHelper(node.children[char], word, index + 1);
    
    if (shouldDelete) {
      delete node.children[char];
      return Object.keys(node.children).length === 0 && !node.isEnd;
    }
    
    return false;
  }
  
  // 获取所有以 prefix 开头的单词
  getWordsWithPrefix(prefix) {
    const words = [];
    let node = this.root;
    
    // 找到前缀对应的节点
    for (const char of prefix) {
      if (!node.children[char]) {
        return words;
      }
      node = node.children[char];
    }
    
    // DFS 收集所有单词
    this._collectWords(node, prefix, words);
    
    return words;
  }
  
  _collectWords(node, prefix, words) {
    if (node.isEnd) {
      words.push(prefix);
    }
    
    for (const char in node.children) {
      this._collectWords(node.children[char], prefix + char, words);
    }
  }
  
  // 统计以 prefix 开头的单词数量
  countWordsWithPrefix(prefix) {
    let node = this.root;
    
    for (const char of prefix) {
      if (!node.children[char]) {
        return 0;
      }
      node = node.children[char];
    }
    
    return node.count;
  }
}
```

---

## 场景题
