const fs = require('fs');
const path = require('path');

// 读取主文件
const mainFile = path.join(__dirname, 'JavaScript面试题集锦.md');
const content = fs.readFileSync(mainFile, 'utf-8');

// 查找所有问题
const questionPattern = /###\s+(\d+\.\s+.+?)\n/g;
const questions = [];
let match;

while ((match = questionPattern.exec(content)) !== null) {
  questions.push({
    number: match[1],
    title: match[1].replace(/^\d+\.\s+/, '')
  });
}

console.log(`找到 ${questions.length} 个问题`);

// 创建问题文件夹
const questionsDir = path.join(__dirname, 'questions');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir);
}

// 清空 questions 文件夹
fs.readdirSync(questionsDir).forEach(file => {
  fs.unlinkSync(path.join(questionsDir, file));
});

// 拆分每个问题
questions.forEach((question, index) => {
  const questionNumber = index + 1;
  const fileName = `${questionNumber}-${questionNumber}__${question.title.replace(/\s+/g, '_')}.md`;
  const filePath = path.join(questionsDir, fileName);
  
  // 提取问题内容
  const pattern = new RegExp(`###\\s+${questionNumber}\\.\\s+.+?\\n\\*\\*答案：\\*\\*([\\s\\S]*?)(?=###\\s+\\d+\\.|$)`, 'm');
  const contentMatch = content.match(pattern);
  
  if (contentMatch) {
    const questionContent = `# ${questionNumber}. ${question.title}\n\n**答案：**\n\n${contentMatch[1].trim()}`;
    
    fs.writeFileSync(filePath, questionContent, 'utf-8');
    console.log(`创建文件: ${fileName}`);
  }
});

// 创建索引文件
const indexContent = `# JavaScript 面试题集锦（截止 2025 年底）\n\n## 目录\n\n${questions.map((q, i) => `${i + 1}. [${i + 1}. ${q.title}](./questions/${i + 1}-${i + 1}__${q.title.replace(/\s+/g, '_')}.md)`).join('\n')}\n\n---\n\n## 问题列表\n\n${questions.map((q, i) => `\n### ${i + 1}. ${q.title}\n\n[查看详细答案](./questions/${i + 1}-${i + 1}__${q.title.replace(/\s+/g, '_')}.md)\n`).join('\n')}\n`;

fs.writeFileSync(path.join(__dirname, 'index.md'), indexContent, 'utf-8');
console.log('创建文件: index.md');

console.log(`完成！共创建 ${questions.length} 个问题文件和 1 个索引文件`);