const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');

// 提取 <script> 标签中的 JavaScript 代码
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let scriptIndex = 0;

while ((match = scriptRegex.exec(html)) !== null) {
    scriptIndex++;
    const scriptContent = match[1];
    const startPos = match.index;
    const endPos = startPos + match[0].length;
    
    console.log(`\n=== Script ${scriptIndex} (${startPos}-${endPos}) ===`);
    
    // 尝试用 Node.js 执行（仅用于语法检查，不实际运行）
    try {
        // 移除可能的 async/await 以避免语法错误
        const cleanScript = scriptContent
            .replace(/\basync\b/g, '')
            .replace(/\bawait\b/g, '')
            .replace(/=>/g, 'function');
        
        new Function(cleanScript);
        console.log('✓ 语法检查通过');
    } catch (error) {
        console.error('✗ 语法错误:');
        console.error(error.message);
        
        // 显示错误附近的代码
        const errorLine = error.stack.match(/<anonymous>:(\d+)/);
        if (errorLine) {
            const lineNum = parseInt(errorLine[1]);
            const lines = scriptContent.split('\n');
            const start = Math.max(0, lineNum - 3);
            const end = Math.min(lines.length, lineNum + 2);
            console.log('\n错误附近的代码:');
            for (let i = start; i < end; i++) {
                console.log(`${i + 1}: ${lines[i] || ''}`);
            }
        }
    }
}