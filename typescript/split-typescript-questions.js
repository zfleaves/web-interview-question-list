import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取主文件
const mainFile = path.join(__dirname, 'TypeScript面试题集锦.md');
const content = fs.readFileSync(mainFile, 'utf-8');

// 查找所有问题（### 开头的）
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
const questionsDir = path.join(__dirname, 'questions-typescript');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir);
}

// 拆分每个问题
questions.forEach((question, index) => {
  const questionNumber = index + 1;
  const safeTitle = question.title.replace(/[\/\\:*?"<>|？]/g, '_').replace(/\s+/g, '_');
  const fileName = `${String(questionNumber).padStart(2, '0')}-${questionNumber}__${safeTitle}.md`;
  const filePath = path.join(questionsDir, fileName);
  
  // 提取问题内容：从当前问题的 ### 开始，到下一个 ###、--- 或文件结束
  const pattern = new RegExp(`###\\s+${questionNumber}\\.\\s+.+?\\n\\n\\*\\*答案：\\*\\*([\\s\\S]*?)(?=\\n\\n###\\s+\\d+\\.|\\n\\n---|$)`);
  const contentMatch = content.match(pattern);
  
  if (contentMatch) {
    const questionContent = `# ${questionNumber}. ${question.title}\n\n**答案：**\n\n${contentMatch[1].trim()}`;
    
    fs.writeFileSync(filePath, questionContent, 'utf-8');
    console.log(`创建文件: ${fileName}`);
  } else {
    console.log(`警告：无法提取问题 ${questionNumber} 的内容`);
  }
});

// 创建索引文件
const indexContent = `# TypeScript 面试题集锦（截止 2025 年底）

## 目录

${questions.map((q, i) => `${i + 1}. [${i + 1}. ${q.title}](./questions-typescript/${String(i + 1).padStart(2, '0')}-${i + 1}__${q.title.replace(/[\/\\:*?"<>|？]/g, '_').replace(/\s+/g, '_')}.md)`).join('\n')}

---

## 问题列表

${questions.map((q, i) => `
### ${i + 1}. ${q.title}

[查看详细答案](./questions-typescript/${String(i + 1).padStart(2, '0')}-${i + 1}__${q.title.replace(/[\/\\:*?"<>|？]/g, '_').replace(/\s+/g, '_')}.md)`).join('\n')}
`;

fs.writeFileSync(path.join(__dirname, 'index.md'), indexContent, 'utf-8');
console.log('创建文件: index.md');

console.log(`完成！共创建 ${questions.length} 个问题文件和 1 个索引文件`);