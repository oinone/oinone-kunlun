import { ExpressionExecutor } from '../../ast';
import { RSQLLanguageInstance } from '../../ast/language';
import { RSQLStringAdapterInstance } from '../../ast/visitor/to-string';
import { RSQLLocale, RSQLTranslateAdapter } from '../../ast/visitor/translate';
import { model1 } from '../data';
import { CastHelper, RSQLHelper } from '@oinone/kunlun-shared';

// const rsql = "code == '${activeRecord.name}bbb'";
// const rsql = 'code =cole= name';
// const rsql = 'code =colnot= name';
// const rsql = "code == 'aaa'";
// const rsql = "code == '$#{currentUser}'";
// const rsql = "code =gt= 100";
// const rsql = "code =ge= 100";
// const rsql = "code =lt= 100";
// const rsql = "code =le= 100";
// const rsql = "code =in= (1, 2, 3)";
// const rsql = "code =out= (1, 2, 3)";
// const rsql = "code =isnull= true";
// const rsql = "code =isnull= false";
// const rsql = "code =notnull= true";
const rsql = 'code =notnull= false';
// const rsql = "code =like= 'aaa'";
// const rsql = "code =starts= 'aaa'";
// const rsql = "code =ends= 'aaa'";
// const rsql = "code =notlike= 'aaa'";
// const rsql = "code =notstarts= 'aaa'";
// const rsql = "code =notends= 'aaa'";
// const rsql = "code =has= (AAA, BBB)";
// const rsql = "code =hasnt= (AAA, BBB)";
// const rsql = "code =bit= (AAA, BBB)";
// const rsql = "code =notbit= (AAA, BBB)";

console.log(rsql);

console.log('------------------------------------------------------------------------');

const root = RSQLHelper.parseRSQL(rsql, {
  model: model1.model,
  fields: CastHelper.cast(model1.modelFields)
});

console.log(root);

if (root) {
  console.log(RSQLHelper.toRSQL(root));
}

console.log('------------------------------------------------------------------------');

const node = ExpressionExecutor.parser(rsql, { language: RSQLLanguageInstance });
if (node) {
  const s = ExpressionExecutor.toString(node, RSQLStringAdapterInstance);
  console.log(s);
  const node2 = ExpressionExecutor.parser(s, { language: RSQLLanguageInstance });
  console.log('node', node);
  console.log('node2', node2);
}

console.log(
  ExpressionExecutor.translate(rsql, {
    language: RSQLLanguageInstance,
    visitor: new RSQLTranslateAdapter({
      model: model1,
      locale: RSQLLocale.zhCN
    })
  })
);
