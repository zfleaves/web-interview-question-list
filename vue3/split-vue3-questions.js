const fs = require('fs');
const path = require('path');

// 读取 Vue3 面试题集锦
const filePath = path.join(__dirname, 'Vue3面试题集锦.md');
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

console.log(`找到 ${questions.length} 个 Vue3 问题`);

// 创建 questions-vue3 目录
const questionsDir = path.join(__dirname, 'questions-vue3');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir);
}

// 为每个问题创建单独的 md 文件
questions.forEach((question, index) => {
  const fileName = `${String(question.number).padStart(2, '0')}-${question.title.replace(/[^\w\u4e00-\u9fa5]/g, '_')}.md`;
  const filePath = path.join(questionsDir, fileName);

  const fileContent = `# ${question.title}\n\n**答案：**\n\n${question.answer}\n`;

  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`创建文件: ${fileName}`);
});

// 创建 index-vue3.md
const indexContent = `# Vue3 面试题集锦（截止 2025 年底）\n\n## 目录\n\n${questions.map(q => `${q.number}. [${q.title}](./questions-vue3/${String(q.number).padStart(2, '0')}-${q.title.replace(/[^\w\u4e00-\u9fa5]/g, '_')}.md)`).join('\n')}\n\n---\n\n## 问题列表\n\n${questions.map(q => `\n### ${q.number}. ${q.title}\n\n[查看详细答案](./questions-vue3/${String(q.number).padStart(2, '0')}-${q.title.replace(/[^\w\u4e00-\u9fa5]/g, '_')}.md)`).join('\n')}\n`;

const indexFilePath = path.join(__dirname, 'index-vue3.md');
fs.writeFileSync(indexFilePath, indexContent, 'utf-8');
console.log('创建文件: index-vue3.md');

console.log('\n完成！共创建 ' + questions.length + ' 个 Vue3 问题文件和 1 个索引文件');