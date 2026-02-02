import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取主文件
const mainFile = path.join(__dirname, 'HTTP面试题集锦.md');
const content = fs.readFileSync(mainFile, 'utf-8');

// 移除开头的标题行（如果存在）
let processedContent = content;
if (processedContent.startsWith('# HTTP 面试题集锦')) {
  processedContent = processedContent.substring(processedContent.indexOf('\n') + 1);
}

// 分割问题
const questions = processedContent.split(/^## /gm).filter(q => {
  const trimmed = q.trim();
  // 排除"总结"部分
  return trimmed && !trimmed.startsWith('总结');
});

// 创建 questions 目录
const questionsDir = path.join(__dirname, 'questions-http');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir, { recursive: true });
}

// 生成问题文件
questions.forEach((question, index) => {
  const questionNumber = index + 1;
  const title = question.split('\n')[0].trim();
  // 移除特殊字符，只保留中英文、数字、下划线、连字符
  const safeTitle = title.replace(/[\/\\:*?"<>|？。,、（）\(\)]/g, '_').replace(/\s+/g, '_').replace(/[\.]/g, '_');
  const fileName = `${String(questionNumber).padStart(2, '0')}__${questionNumber}__${safeTitle}.md`;
  const filePath = path.join(questionsDir, fileName);

  const questionContent = `## ${question.trim()}`;
  fs.writeFileSync(filePath, questionContent, 'utf-8');

  console.log(`Created: ${fileName}`);
});

// 生成索引文件
const indexContent = `# HTTP 面试题集锦（截止 2025 年底）

## 目录

${questions.map((question, index) => {
  const questionNumber = index + 1;
  const title = question.split('\n')[0].trim();
  const safeTitle = title.replace(/[\/\\:*?"<>|？。,、（）\(\)]/g, '_').replace(/\s+/g, '_').replace(/[\.]/g, '_');
  const fileName = `${String(questionNumber).padStart(2, '0')}__${questionNumber}__${safeTitle}.md`;
  return `${questionNumber}. [${title}](./questions-http/${fileName})`;
}).join('\n')}

---

## 问题列表

${questions.map((question, index) => {
  const questionNumber = index + 1;
  const title = question.split('\n')[0].trim();
  const safeTitle = title.replace(/[\/\\:*?"<>|？。,、（）\(\)]/g, '_').replace(/\s+/g, '_').replace(/[\.]/g, '_');
  const fileName = `${String(questionNumber).padStart(2, '0')}__${questionNumber}__${safeTitle}.md`;
  return `
### ${questionNumber}. ${title}

[查看详细答案](./questions-http/${fileName})`;
}).join('\n')}
`;

fs.writeFileSync(path.join(__dirname, 'index.md'), indexContent, 'utf-8');
console.log('Created: index.md');

console.log(`Total questions: ${questions.length}`);