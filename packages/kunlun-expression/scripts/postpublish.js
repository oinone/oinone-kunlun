/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const path = require('path');

const url = path.resolve(process.cwd(), 'package.json');

const packageJSON = require(url);

packageJSON.main = 'index.ts';
delete packageJSON.module;
delete packageJSON.typings;
delete packageJSON.files;

fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2));
