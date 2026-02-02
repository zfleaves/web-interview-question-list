import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取主文件
const mainFile = path.join(__dirname, 'qiankun微前端面试题集锦.md');
let content = fs.readFileSync(mainFile, 'utf-8');
// 移除 Windows 的 \r
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 查找所有问题（只匹配 ## 级别，不匹配 ### 级别）
// 不使用 ^，直接匹配 ## 前面是换行符或文件开头
const questionPattern = /(?:^|\n)##\s+(\d+)\.\s+(.+?)\n/gm;
const questions = [];
let match;

while ((match = questionPattern.exec(content)) !== null) {
  questions.push({
    number: parseInt(match[1], 10),
    title: match[2].trim()
  });
}

console.log(`找到 ${questions.length} 个问题`);

// 创建问题文件夹
const questionsDir = path.join(__dirname, 'questions-qiankun');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir, { recursive: true });
}

// 清空 questions 文件夹
fs.readdirSync(questionsDir).forEach(file => {
  fs.unlinkSync(path.join(questionsDir, file));
});

// 拆分每个问题
questions.forEach((question, index) => {
  const questionNumber = question.number;
  const safeTitle = question.title.replace(/[\/\\:*?"<>|？。,、（）\(\)]/g, '_').replace(/\s+/g, '_');
  const fileName = `${String(questionNumber).padStart(2, '0')}__${questionNumber}__${safeTitle}.md`;
  const filePath = path.join(questionsDir, fileName);
  
  // 提取问题内容：从当前问题的 ## 开始，到下一个 ## 或文件结束
  const pattern = new RegExp(`##\\s+${questionNumber}\\.\\s+.+?\\n\\n\\*\\*答案：\\*\\*([\\s\\S]*?)(?=\\n\\n##\\s+\\d+\\.|$)`);
  const contentMatch = content.match(pattern);
  
  if (contentMatch) {
    const questionContent = `# ${questionNumber}. ${question.title}\n\n**答案：**\n\n${contentMatch[1].trim()}`;
    
    fs.writeFileSync(filePath, questionContent, 'utf-8');
    console.log(`创建文件: ${fileName}`);
  } else {
    console.log(`警告：无法提取问题 ${questionNumber} 的内容`);
  }
});

// 生成索引文件
const indexContent = `# qiankun 微前端面试题集锦（截止 2025 年底）

## 目录

${questions.map(q => {
  const safeTitle = q.title.replace(/[\/\\:*?"<>|？。,、（）\(\)]/g, '_').replace(/\s+/g, '_');
  return `${q.number}. [${q.number}. ${q.title}](./questions-qiankun/${String(q.number).padStart(2, '0')}__${q.number}__${safeTitle}.md)`;
}).join('\n')}

---

## 问题列表

${questions.map(q => {
  const safeTitle = q.title.replace(/[\/\\:*?"<>|？。,、（）\(\)]/g, '_').replace(/\s+/g, '_');
  return `
### ${q.number}. ${q.title}

[查看详细答案](./questions-qiankun/${String(q.number).padStart(2, '0')}__${q.number}__${safeTitle}.md)`;
}).join('\n')}
`;

fs.writeFileSync(path.join(__dirname, 'index-qiankun.md'), indexContent, 'utf-8');
console.log('创建文件: index-qiankun.md');

console.log(`完成！共创建 ${questions.length} 个问题文件和 1 个索引文件`);