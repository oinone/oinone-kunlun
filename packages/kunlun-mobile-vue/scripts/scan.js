// /* eslint-disable @typescript-eslint/no-var-requires */
// const fs = require('fs');
// const chineseRegex = /[\u4e00-\u9fa5]+/g;

// const needLog = process.argv[2] === 'log';

// // 递归扫描文件夹
// function scanDirectory(directoryPath) {
//   const files = fs.readdirSync(directoryPath);
//   for (const file of files) {
//     const filePath = `${directoryPath}/${file}`;
//     const stats = fs.statSync(filePath);

//     if (stats.isFile()) {
//       // eslint-disable-next-line @typescript-eslint/no-unused-expressions
//       needLog ? scanFile(filePath) : replaceChineseInFile(filePath);
//     } else if (stats.isDirectory()) {
//       scanDirectory(filePath);
//     }
//   }
// }

// // 检查文件中是否包含中文字符
// function scanFile(filePath) {
//   const fileContent = fs.readFileSync(filePath, 'utf-8');
//   const lines = fileContent.split('\n');
//   let inMultilineComment = false;

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];
//     if (!inMultilineComment) {
//       if (!line.includes('/*')) {
//         const singleLineCommentIndex = line.indexOf('//');
//         if (singleLineCommentIndex !== -1) {
//           const codeBeforeComment = line.slice(0, singleLineCommentIndex);
//           logPosition(filePath, i + 1, codeBeforeComment);
//         } else {
//           logPosition(filePath, i + 1, line);
//         }
//       } else {
//         inMultilineComment = true;
//       }
//     }
//     if (inMultilineComment && line.includes('*/')) {
//       inMultilineComment = false;
//     }
//   }
// }

// // 处理每一行，输出中文字符的位置
// function logPosition(filePath, lineNumber, line) {
//   const chineseRegex = /[\u4e00-\u9fa5]+/g;
//   let match;
//   // eslint-disable-next-line no-cond-assign
//   while ((match = chineseRegex.exec(line)) !== null) {
//     const columnNumber = match.index + 1;
//     console.log(`${filePath}(${lineNumber},${columnNumber}) ${match[0]}`);
//   }
// }

// // 检查文件中是否包含中文字符，并替换
// function replaceChineseInFile(filePath) {
//   const fileContent = fs.readFileSync(filePath, 'utf-8');
//   const lines = fileContent.split('\n');

//   for (let i = 0; i < lines.length; i++) {
//     lines[i] = processLine(lines[i]);
//   }

//   // 重建文件内容
//   const newFileContent = lines.join('\n');
//   fs.writeFileSync(filePath, newFileContent, 'utf-8');
// }

// // 处理每一行，替换中文字符为指定方法，保留注释内容不受影响
// function processLine(line) {
//   const commentedLineRegex = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|\/\*\*[\s\S]*?\*\*\//g;
//   if (commentedLineRegex.test(line)) {
//     return line;
//   }

//   if (line.indexOf('*') > -1 || line.indexOf('<!--') > -1) {
//     return line;
//   }
//   // 只替换非注释部分的中文字符
//   return line.replace(chineseRegex, (chinese) => `translateValueByKey('${chinese}')`);
// }

// // 主函数，指定要扫描的文件夹路径
// function main() {
//   const directoryPaths = ['./packages/mobile-base/src', './packages/ui-mobile-vant/src'];

//   for (const path of directoryPaths) {
//     scanDirectory(path);
//   }
// }

// main();
