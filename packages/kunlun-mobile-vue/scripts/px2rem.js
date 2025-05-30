const fs = require('fs');
const postcss = require('postcss');
const pxtorem = require('postcss-pxtorem');

function px2rem(fileName) {
  const css = fs.readFileSync(fileName, 'utf8');
  const options = {
    rootValue: 75,
    unitPrecision: 4, // 保留小数位
    propList: ['*'],
    replace: true, // 默认直接替换属性
    mediaQuery: false,
    minPixelValue: 6 // 所有小于设置的样式都不被转换
  };

  const processedCss = postcss(pxtorem(options)).process(css).css;

  fs.writeFile(fileName, processedCss, (err) => {
    if (err) {
      throw err;
    }
    console.log('Rem css file build success!');
  });
}

const fileName = process.argv[2];
px2rem(fileName);
