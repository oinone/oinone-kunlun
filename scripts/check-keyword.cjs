#!/usr/bin/env node

/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
const logger = console;

const { execSync } = require('child_process');
const fs = require('fs');

const fieldNames = execSync('git diff --name-only --cached')
  .toString('utf8')
  .trim()
  .split('\n')
  .filter((name) => !name.startsWith('scripts/') && name && fs.existsSync(name));

const checkKeyword = (content) => {
  // 字符串的debugger 不需要处理
  if (content.includes(`'debugger'`)) {
    return false;
  }

  if (content.includes(`debugger`)) {
    return true;
  }

  if (content.includes(`console.log`)) {
    return true;
  }

  if (content.includes(`alert(`)) {
    return true;
  }

  return false;
};

for (let index = 0; index < fieldNames.length; index++) {
  const path = fieldNames[index];
  const field = fs
    .readFileSync(path, {
      encoding: 'utf-8'
    })
    .toString()
    .trim();

  if (checkKeyword(field)) {
    logger.log('\x1B[31m%s\x1B[0m', `${path} 文件存在 ['debugger', 'console.log', 'alert']，请删除后再提交.`);
    process.exit(1);
    break;
  }
}
