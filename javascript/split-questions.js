import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取主文件
const mainFile = path.join(__dirname, 'JavaScript面试题集锦.md');
const content = fs.readFileSync(mainFile, 'utf-8');

// 分割问题
const questions = content.split(/^###\s+/gm).filter(q => q.trim());

// 跳过第一个（标题文件）
const actualQuestions = questions.slice(1);

console.log(`找到 ${actualQuestions.length} 个问题`);

// 创建问题文件夹
const questionsDir = path.join(__dirname, 'questions');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir);
}

// 清空 questions 文件夹
fs.readdirSync(questionsDir).forEach(file => {
  fs.unlinkSync(path.join(questionsDir, file));
});

// 生成问题文件
actualQuestions.forEach((question, index) => {
  const lines = question.split('\n');
  const firstLine = lines[0].trim(); // 例如：1. JavaScript 的数据类型有哪些？
  const questionNumber = index + 1;
  
  // 移除开头的数字和点号
  const title = firstLine.replace(/^\d+\.\s+/, '');
  const safeTitle = title.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_');
  const fileName = `${questionNumber}-${questionNumber}__${safeTitle}.md`;
  const filePath = path.join(questionsDir, fileName);

  const questionContent = `# ${questionNumber}. ${title}\n\n${lines.slice(1).join('\n').trim()}`;
  fs.writeFileSync(filePath, questionContent, 'utf-8');
  console.log(`创建文件: ${fileName}`);
});

// 创建索引文件
const indexContent = `# JavaScript 面试题集锦（截止 2025 年底）

## 目录

${actualQuestions.map((q, i) => {
  const lines = q.split('\n');
  const firstLine = lines[0].trim();
  const title = firstLine.replace(/^\d+\.\s+/, '');
  return `${i + 1}. [${i + 1}. ${title}](./questions/${i + 1}-${i + 1}__${title.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_')}.md)`;
}).join('\n')}

---

## 问题列表

${actualQuestions.map((q, i) => {
  const lines = q.split('\n');
  const firstLine = lines[0].trim();
  const title = firstLine.replace(/^\d+\.\s+/, '');
  return `
### ${i + 1}. ${title}

[查看详细答案](./questions/${i + 1}-${i + 1}__${title.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_')}.md)`;
}).join('\n')}
`;

fs.writeFileSync(path.join(__dirname, 'index.md'), indexContent, 'utf-8');
console.log('创建文件: index.md');

console.log(`完成！共创建 ${actualQuestions.length} 个问题文件和 1 个索引文件`);