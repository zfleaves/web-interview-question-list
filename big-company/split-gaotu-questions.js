import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainFile = path.join(__dirname, '高途面试题集锦.md');
const outputDir = path.join(__dirname, 'questions-gaotu');
const indexFile = path.join(__dirname, 'index-gaotu.md');

// 创建输出目录
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 读取主文件
let content = fs.readFileSync(mainFile, 'utf-8');
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 匹配问题
const questionPattern = /(?:^|\n)(?:###|##)\s*(\d+)\.\s+(.+?)\n/gm;
const questions = [];
let match;

while ((match = questionPattern.exec(content)) !== null) {
  const level = match[1]; // ### 或 ## 表示问题级别
  const number = parseInt(match[1]);
  const title = match[2].trim();
  
  // 去除下划线标记（红色波浪线）
  const cleanTitle = title.replace(/~/g, '').replace(/\s+/g, ' ');
  
  questions.push({
    number: number,
    title: cleanTitle
  });
}

console.log(`找到 ${questions.length} 个问题`);

// 提取每个问题的内容
questions.forEach(q => {
  const cleanTitle = q.title.replace(/[\/\\:*?"<>|？。,、（）\(\)]/g, '_').replace(/\s+/g, '_');
  const pattern = new RegExp(`(?:^|\\n)(?:###|##)\\s+${q.number}\\.\\s+[\\s\\S]*?\\n\\*\\*答案：\\*\\*\\s*([\\s\\S]*?)(?=\\n(?:###|##)\\s+\\d+\\.|$)`);
  const contentMatch = content.match(pattern);
  
  const questionContent = contentMatch 
    ? contentMatch[1].trim() 
    : '内容提取失败';
  
  const filename = `${String(q.number).padStart(2, '0')}__${q.number}__${cleanTitle}.md`;
  const filepath = path.join(outputDir, filename);
  
  const mdContent = `# ${q.number}. ${q.title}\n\n**答案：**\n\n${questionContent}\n`;
  
  fs.writeFileSync(filepath, mdContent, 'utf-8');
  console.log(`生成: ${filename}`);
});

// 生成索引文件
const indexContent = `# 高途面试题集锦\n\n本目录包含高途前端面试题，按题目编号组织。\n\n## 题目列表\n\n${questions.map(q => {
  const cleanTitle = q.title.replace(/[\/\\:*?"<>|？。,、（）\(\)]/g, '_').replace(/\s+/g, '_');
  return `${q.number}. [${q.number}. ${cleanTitle}](./questions-gaotu/${String(q.number).padStart(2, '0')}__${q.number}__${cleanTitle}.md)`;
}).join('\n')}\n\n---\n\n**题目总数**: ${questions.length}\n**最后更新**: ${new Date().toLocaleDateString('zh-CN')}\n`;

fs.writeFileSync(indexFile, indexContent, 'utf-8');
console.log(`\n生成索引文件: index-gaotu.md`);
console.log(`完成! 共生成 ${questions.length} 个问题文件`);
