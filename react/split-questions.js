const fs = require('fs');
const path = require('path');

// 读取 React 面试题集锦
const filePath = path.join(__dirname, 'React面试题集锦.md');
const content = fs.readFileSync(filePath, 'utf-8');

// 使用正则表达式提取所有问题
const questionRegex = /###\s+(\d+\.\s+.+?)\n\n\*\*答案：\*\*\n\n([\s\S]*?)(?=\n\n---|\n\n## |$)/g;

const questions = [];
let match;

while ((match = questionRegex.exec(content)) !== null) {
  const title = match[1].trim();
  const answer = match[2].trim();
  const questionNumber = parseInt(match[1].match(/(\d+)\./)[1]);

  questions.push({
    number: questionNumber,
    title: title,
    answer: answer
  });
}

console.log(`找到 ${questions.length} 个问题`);

// 创建 questions 目录
const questionsDir = path.join(__dirname, 'questions');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir);
}

// 为每个问题创建单独的 md 文件
questions.forEach((question, index) => {
  const fileName = `${String(question.number).padStart(2, '0')}-${question.title.replace(/[^\w\u4e00-\u9fa5]/g, '_')}.md`;
  const filePath = path.join(questionsDir, fileName);

  const fileContent = `# ${question.title}

**答案：**

${question.answer}
`;

  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`创建文件: ${fileName}`);
});

// 创建 index.md
const indexContent = `# React 面试题集锦（截止 2025 年底）

## 目录

${questions.map(q => `${q.number}. [${q.title}](./questions/${String(q.number).padStart(2, '0')}-${q.title.replace(/[^\w\u4e00-\u9fa5]/g, '_')}.md)`).join('\n')}

---

## 问题列表

${questions.map(q => `
### ${q.number}. ${q.title}

[查看详细答案](./questions/${String(q.number).padStart(2, '0')}-${q.title.replace(/[^\w\u4e00-\u9fa5]/g, '_')}.md)
`).join('\n')}
`;

const indexFilePath = path.join(__dirname, 'index.md');
fs.writeFileSync(indexFilePath, indexContent, 'utf-8');
console.log('创建文件: index.md');

console.log('\n完成！共创建 ' + questions.length + ' 个问题文件和 1 个索引文件');