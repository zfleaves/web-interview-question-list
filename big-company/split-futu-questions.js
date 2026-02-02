import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainFile = path.join(__dirname, '富途面试题集锦.md');
const outputDir = path.join(__dirname, 'questions-futu');
const indexFile = path.join(__dirname, 'index-futu.md');

// 创建输出目录
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 读取主文件
let content = fs.readFileSync(mainFile, 'utf-8');
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 匹配问题 - 只匹配 ### 级别的问题（富途面试题使用三级标题）
const questionPattern = /(?:^|\n)###\s+(\d+)\.\s+(.+?)\n/gm;
const questions = [];
let match;

while ((match = questionPattern.exec(content)) !== null) {
  questions.push({
    number: parseInt(match[1]),
    title: match[2].trim()
  });
}

console.log(`找到 ${questions.length} 个问题`);

// 提取每个问题的内容
questions.forEach(q => {
  const safeTitle = q.title.replace(/[\/\\:*?"<>|？。,、（）\(\)]/g, '_').replace(/\s+/g, '_');
  const pattern = new RegExp(`###\\s+${q.number}\\.\\s+.+?\\n\\n\\*\\*答案：\\*\\*([\\s\\S]*?)(?=\\n\\n###\\s+\\d+\\.|$)`);
  const contentMatch = content.match(pattern);
  
  const questionContent = contentMatch 
    ? contentMatch[1].trim() 
    : '内容提取失败';
  
  const filename = `${String(q.number).padStart(2, '0')}__${q.number}__${safeTitle}.md`;
  const filepath = path.join(outputDir, filename);
  
  const mdContent = `# ${q.number}. ${q.title}

**答案：**

${questionContent}
`;
  
  fs.writeFileSync(filepath, mdContent, 'utf-8');
  console.log(`生成: ${filename}`);
});

// 生成索引文件
const indexContent = `# 富途面试题集锦

本目录包含富途前端面试题，按题目编号组织。

## 题目列表

${questions.map(q => {
  const safeTitle = q.title.replace(/[\/\\:*?"<>|？。,、（）\(\)]/g, '_').replace(/\s+/g, '_');
  return `${q.number}. [${q.number}. ${q.title}](./questions-futu/${String(q.number).padStart(2, '0')}__${q.number}__${safeTitle}.md)`;
}).join('\n')}

---

**题目总数**: ${questions.length}
**最后更新**: ${new Date().toLocaleDateString('zh-CN')}
`;

fs.writeFileSync(indexFile, indexContent, 'utf-8');
console.log(`\n生成索引文件: index-futu.md`);
console.log(`完成! 共生成 ${questions.length} 个问题文件`);