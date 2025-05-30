/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const url = path.resolve(process.cwd(), 'package.json');
const packageJSON = require(url);

const libName = packageJSON.name.replace('@', '').replace('/', '-');

packageJSON.main = `dist/${libName}.umd.js`;
packageJSON.module = `dist/${libName}.umd.js`;
const typings = 'dist/types/index.d.ts';
packageJSON.typings = typings;

const typingsUrl = path.resolve(process.cwd(), typings);
const dir = fs.existsSync(typingsUrl);

if (!dir) {
  packageJSON.typings = 'dist/index.d.ts';
}

packageJSON.files = ['dist'];

fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2));
