const fs = require('fs');
const path = require('path');

// 读取主文件
const mainFile = path.join(__dirname, 'ES6面试题集锦.md');
const content = fs.readFileSync(mainFile, 'utf-8');

// 创建 questions-es6 目录
const questionsDir = path.join(__dirname, 'questions-es6');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir, { recursive: true });
}

// 按照题目分割
const lines = content.split('\n');
let currentQuestion = null;
let questionNumber = 0;
let questionContent = [];

lines.forEach((line, index) => {
  // 匹配题目：## 数字. 题目
  const match = line.match(/^##\s+(\d+)\.\s+(.+)$/);
  
  if (match) {
    // 保存上一个题目
    if (currentQuestion) {
      // 清理文件名中的特殊字符
      const safeQuestion = currentQuestion
        .replace(/[?？]/g, '')
        .replace(/[\/\\]/g, '_')
        .replace(/[<>:"|?*]/g, '');
      const fileName = `${String(questionNumber).padStart(2, '0')}__${questionNumber}_${safeQuestion}.md`;
      const filePath = path.join(questionsDir, fileName);
      fs.writeFileSync(filePath, questionContent.join('\n'), 'utf-8');
      console.log(`Created: ${fileName}`);
    }
    
    // 开始新题目
    questionNumber = parseInt(match[1]);
    currentQuestion = match[2];
    questionContent = [line];
  } else {
    questionContent.push(line);
  }
});

// 保存最后一个题目
if (currentQuestion) {
  // 清理文件名中的特殊字符
  const safeQuestion = currentQuestion
    .replace(/[?？]/g, '')
    .replace(/[\/\\]/g, '_')
    .replace(/[<>:"|?*]/g, '');
  const fileName = `${String(questionNumber).padStart(2, '0')}__${questionNumber}_${safeQuestion}.md`;
  const filePath = path.join(questionsDir, fileName);
  fs.writeFileSync(filePath, questionContent.join('\n'), 'utf-8');
  console.log(`Created: ${fileName}`);
}

console.log(`Total questions: ${questionNumber}`);