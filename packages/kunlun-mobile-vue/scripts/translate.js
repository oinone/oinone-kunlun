/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const chineseArr = [];

function scanDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  for (const file of files) {
    const filePath = `${directoryPath}/${file}`;
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      scanFile(filePath);
    } else if (stats.isDirectory()) {
      scanDirectory(filePath);
    }
  }
}

// 查找并打印函数调用中的参数及其对应的英文
function scanFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const regex = /translateValueByKey\(["']([^"']+)["']\)/g;

  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    const key = match[1];
    chineseArr.push(key);
  }
}

// 主函数，指定要扫描的目录
function main() {
  const directoryPaths = ['./packages/mobile-base/src', './packages/ui-mobile-vant/src'];

  for (const path of directoryPaths) {
    scanDirectory(path);
  }
}

main();

for (const key of chineseArr) {
  console.log(key);
}
