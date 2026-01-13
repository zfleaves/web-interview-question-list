const fs = require('fs');
const path = require('path');

// 读取主文件
const mainFile = path.join(__dirname, 'Webpack面试题集锦.md');
const content = fs.readFileSync(mainFile, 'utf-8');

// 分割问题
const questions = content.split(/^## /gm).filter(q => q.trim());

// 创建 questions 目录
const questionsDir = path.join(__dirname, 'questions-webpack');
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