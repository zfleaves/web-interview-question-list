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
  const title = question.split('\n')[0].trim();
  // 移除特殊字符，只保留中英文、数字、下划线、连字符
  const safeTitle = title.replace(/[^\w\u4e00-\u9fa5\-]/g, '_');
  const fileName = `${String(index + 1).padStart(2, '0')}__${safeTitle}.md`;
  const filePath = path.join(questionsDir, fileName);

  const questionContent = `## ${question.trim()}`;
  fs.writeFileSync(filePath, questionContent, 'utf-8');

  console.log(`Created: ${fileName}`);
});

console.log(`Total questions: ${questions.length}`);