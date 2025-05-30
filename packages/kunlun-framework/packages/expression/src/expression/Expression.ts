import { NumberHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import {
  COLLECTION_FUNCTION,
  CONVERT_FUNCTION,
  DATETIME_FUNCTION,
  LOGIC_FUNCTION,
  MATCH_FUNCTION,
  MATH_FUNCTION,
  OBJECT_FUNCTION,
  STRING_FUNCTION
} from '../function';
import { ExpressionRunParam } from './ExpressionDefinition';
import { ExpressionKeyword, IExpression, IToken, ITokenTree, Language } from './language';
import { Runtime, Variable } from './runtime';
import { ExpressionExecutorServiceToken } from './spi/ExpressionExecutorService';

const symbols = [
  '!==',
  '===',
  '>>>',
  '>>',
  '<<',
  '==',
  '!=',
  '>=',
  '<=',
  '++',
  '--',
  '&&',
  '||',
  '=>',
  '+',
  '-',
  '*',
  '/',
  '%',
  '.',
  ',',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  ':',
  '?',
  '&',
  '|',
  '!',
  '^',
  '~',
  '=',
  '>',
  '<'
];
const keywords = [
  'const ',
  'let',
  'new',
  'if',
  'else',
  'while',
  'for',
  'return',
  'function',
  'break',
  'switch',
  'default',
  'do',
  'debugger',
  'continue',
  'case',
  'this',
  'true',
  'false',
  'typeof',
  'instanceof',
  'undefined',
  'null',
  'unknown',
  'NaN'
];

/**
 * 函数解析成tokens的最小数组长度，匿名函数 NOW_STR() 会解析为如下结构
 *  [
 {type: 'token', text: 'NOW_STR', avalible: true},
 {type: 'symbol', text: '(', avalible: true},
 {type: 'symbol', text: ')', avalible: true}
 ]
 */
const FUN_TOKENS_MIN_LENGTH = 3;

export class Expression {
  private lang: Language;

  private runtime: Runtime;

  private keywordPatten = {
    name: 'keyword',
    test: (text: string) => {
      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        if (text.startsWith(keyword)) {
          const nextText = text[keyword.length];
          if (!nextText || !/^\w+/.test(nextText)) {
            return keyword.length;
          }
          return 0;
        }
      }
      return 0;
    }
  };

  private tokenPatten = {
    name: 'token',
    test: (text: string) => {
      const res = /^\w+/.exec(text);
      if (res) {
        const t = res[0];
        if (!/^(-?\d+)(\.\d+)?/.test(t)) {
          return t.length;
        }
      }
      return 0;
    }
  };

  private numberPatten = {
    name: 'number',
    test: (text: string) => {
      const res = /^(-?\d+)(\.\d+)?/.exec(text);
      if (res) {
        return res[0].length;
      }
      return 0;
    }
  };

  private stringPatten = {
    name: 'string',
    test: (text: string) => {
      if (text.startsWith('"')) {
        for (let i = 1; i < text.length; i++) {
          if (text.charAt(i) === '"' && text.charAt(i - 1) !== '\\') {
            return i + 1;
          }
        }
      }
      if (text.startsWith("'")) {
        for (let i = 1; i < text.length; i++) {
          if (text.charAt(i) === "'" && text.charAt(i - 1) !== '\\') {
            return i + 1;
          }
        }
      }
      return 0;
    }
  };

  private commentsPatten = {
    name: 'comments',
    test: (text: string) => {
      if (text.startsWith('//')) {
        for (let i = 2; i < text.length; i++) {
          if (text.charAt(i) === '\n') {
            return i + 1;
          }
        }
      }
      if (text.startsWith('/*')) {
        for (let i = 2; i < text.length; i++) {
          if (text.charAt(i) === '*' && text.charAt(i + 1) === '/') {
            return i + 2;
          }
        }
      }
      return 0;
    },
    avalible: false
  };

  private symbolPatten = {
    name: 'symbol',
    test: (text: string) => {
      for (let i = 0; i < symbols.length; i++) {
        if (text.startsWith(symbols[i])) {
          return symbols[i].length;
        }
      }
      return 0;
    }
  };

  private blankPatten = {
    name: 'blank',
    test: (text: string) => {
      if (text.startsWith(' ')) {
        return 1;
      }
      return 0;
    },
    avalible: false
  };

  private newLinePatten = {
    name: 'blank',
    test: (text: string) => {
      if (text.startsWith('\n')) {
        return 1;
      }
      return 0;
    }
  };

  private endPatten = {
    name: 'end',
    test: (test: string) => {
      if (test.startsWith(';\n')) {
        return 2;
      }
      if (test.startsWith(';') || test.startsWith(';')) {
        return 1;
      }
      return 0;
    }
  };

  private blockPatten = {
    name: 'block',
    test: (tokens: IToken[]) => {
      const pos = this.lang.checkToken('}', tokens);
      if (pos !== -1 && pos !== tokens.length - 1) {
        return tokens.length;
      }
      return 0;
    },
    parse: (tokens: IToken[]) => {
      const pos = this.lang.checkToken('}', tokens);
      return {
        type: 'block',
        operator: { text: '{}', type: 'block', avalible: true },
        left: this.lang.parseExpression(tokens.slice(0, pos + 1)),
        right: this.lang.parseExpression(tokens.slice(pos + 1))
      };
    }
  };

  private fullBlockPatten = {
    name: 'fullBlock',
    test: (tokens: IToken[]) => {
      if (tokens[0].text === '{' && tokens[tokens.length - 1].text === '}') {
        return tokens.length;
      }
      return 0;
    },
    parse: (tokens: IToken[]): IExpression => {
      return {
        type: 'fullBlock',
        operator: { type: 'fullBlock', text: '{}', avalible: true },
        left: this.lang.parseExpression(tokens.slice(1, tokens.length - 1))
      };
    }
  };

  private tokenBlockPatten = {
    name: 'token',
    test: (tokens: IToken[]) => {
      if (tokens.length === 1) {
        return 1;
      }
      return 0;
    },
    parse: (tokens: IToken[]) => {
      return { operator: tokens[0], type: 'variable' };
    }
  };

  private bracketsBlockPatten = {
    name: 'brackets',
    test: (tokens: IToken[]) => {
      if (tokens[0].text === '(' && tokens[tokens.length - 1].text === ')') {
        return tokens.length;
      }
      return 0;
    },
    parse: (tokens: IToken[]) => {
      return {
        operator: { type: '()', text: '()' } as IToken,
        left: this.lang.parseExpression(tokens.slice(1, tokens.length - 1)),
        type: 'brackets'
      };
    }
  };

  private ternaryBlockPatten = {
    name: 'ternary',
    test: (tokens: IToken[]) => {
      if (this.lang.checkToken('?', tokens) !== -1) {
        return tokens.length;
      }
      return 0;
    },
    parse: (tokens: IToken[]) => {
      const pos1 = this.lang.checkToken('?', tokens);
      const pos2 = this.lang.checkToken(':', tokens);
      return {
        type: 'ternary',
        operator: tokens[pos1],
        left: this.lang.parseExpression(tokens.slice(0, pos1)),
        right: {
          operator: tokens[pos2],
          left: this.lang.parseExpression(tokens.slice(pos1 + 1, pos2)),
          right: this.lang.parseExpression(tokens.slice(pos2 + 1)),
          type: 'ternary2'
        }
      };
    }
  };

  private calculateBlockPatten = (_symbols: string[], name: string) => {
    return {
      name,
      test: (tokens: IToken[]) => {
        for (let i = 0; i < _symbols.length; i++) {
          const res = this.lang.checkToken(_symbols[i], tokens);
          if (res !== -1) {
            return tokens.length;
          }
        }
        return 0;
      },
      parse: (tokens: IToken[]) => {
        let pos = 0;
        for (let i = 0; i < _symbols.length; i++) {
          pos = this.lang.checkToken(_symbols[i], tokens);
          if (pos !== -1) {
            break;
          }
        }
        const res = {
          operator: tokens[pos],
          left: this.lang.parseExpression(tokens.slice(0, pos)),
          right: this.lang.parseExpression(tokens.slice(pos + 1)),
          type: name
        };
        return res;
      }
    };
  };

  private defineBlockExpression = {
    name: 'define',
    test: (tokens: IToken[]) => {
      if (tokens[0].text === 'var' || tokens[0].text === 'let' || tokens[0].text === 'const') {
        return tokens.length;
      }
      return 0;
    },
    parse: (tokens: IToken[]) => {
      const result: IExpression = { operator: tokens[0], type: 'define' };
      result.left = this.lang.parseExpression(tokens.slice(1));
      return result;
    }
  };

  private memberBlockExpression = {
    name: 'member',
    test: (tokens: IToken[]) => {
      if (this.lang.checkToken('.', tokens) !== -1) {
        return tokens.length;
      }
      return 0;
    },
    parse: (tokens: IToken[]) => {
      let pos = 0;
      for (let i = tokens.length - 1; i > 0; i--) {
        if (tokens[i].text === '.') {
          pos = i;
          break;
        }
      }
      return {
        operator: tokens[pos],
        type: 'member',
        left: this.lang.parseExpression(tokens.slice(0, pos)),
        right: this.lang.parseExpression(tokens.slice(pos + 1))
      };
    }
  };

  private functionCallBlockPatten = {
    name: 'functionCall',
    test: (tokens: IToken[]) => {
      if (tokens.length >= FUN_TOKENS_MIN_LENGTH && tokens[0].type === 'token' && tokens[1].text === '(') {
        return tokens.length;
      }
      return 0;
    },
    parse: (tokens: IToken[]): IExpression => {
      return {
        type: 'functionCall',
        operator: { type: 'function', text: tokens[0].text, avalible: true },
        left: this.lang.parseExpression(tokens.slice(2, tokens.length - 1))
      };
    }
  };

  private selectBlockPatten = {
    name: 'select',
    test: (tokens: IToken[]) => {
      if (
        tokens.length > 2 &&
        (tokens[0].type === 'token' || tokens[0].text === 'arguments') &&
        tokens[1].text === '['
      ) {
        return tokens.length;
      }
      return 0;
    },
    parse: (tokens: IToken[]): IExpression => {
      return {
        operator: { type: 'select', text: '[]', avalible: true },
        left: this.lang.parseExpression([tokens[0]]),
        right: this.lang.parseExpression(tokens.slice(2, tokens.length - 1)),
        type: 'select'
      };
    }
  };

  private arrayVariablePatten = {
    name: 'arrayVariable',
    test: (tokens: IToken[]) => {
      if (tokens.length < 2) {
        return 0;
      }
      const { type } = tokens[0];
      if (type === 'symbol') {
        if (tokens[0].text === '[' && tokens[tokens.length - 1].text === ']') {
          return tokens.length;
        }
      }
      return 0;
    },
    parse: (tokens: IToken[]): IExpression => {
      return {
        type: 'variable',
        operator: { type: 'keyword', text: 'array', avalible: true },
        right: this.lang.parseExpression(tokens.slice(1, tokens.length - 1))
      };
    }
  };

  private functionBlockPatten = {
    name: 'function',
    test: (tokens: IToken[]) => {
      const pos = this.lang.checkToken('=>', tokens);
      if (pos !== -1) {
        const end = this.lang.checkToken('}', tokens);
        return end + 1;
      }
      return 0;
    },
    parse: (tokens: IToken[]): IExpression => {
      const pos = this.lang.checkToken('=>', tokens);
      const headers = tokens.slice(1, pos - 1);
      const body = tokens.slice(pos + 2, tokens.length - 1);
      return {
        type: 'functionDefine',
        operator: tokens[pos],
        left: {
          type: 'arguments',
          operator: {
            text: headers.map((t) => t.text).join(''),
            type: 'arguments',
            avalible: true
          }
        },
        right: this.lang.parseExpression(body)
      };
    }
  };

  private returnBlockPatten = {
    name: 'return',
    test: (tokens: IToken[]) => {
      if (tokens[0].text === 'return') {
        return tokens.length;
      }
      return 0;
    },
    parse: (tokens: IToken[]): IExpression => {
      return {
        type: 'return',
        operator: tokens[0],
        left: this.lang.parseExpression(tokens.slice(1))
      };
    }
  };

  private execVariable(node: IExpression): Variable {
    const token = node.operator!;
    const { type, text } = token;
    let tokenResult: Variable | undefined;
    if (type === 'token') {
      tokenResult = this.runtime.get(text);
      if (tokenResult) {
        return tokenResult;
      }
      tokenResult = {
        value: undefined,
        type: 'undefined',
        decorate: []
      };
    } else if (type === 'keyword') {
      if (text === 'undefined') {
        return { type: 'undefined', value: undefined, decorate: [] };
      }
      if (text === 'null') {
        return { type: 'null', value: null, decorate: [] };
      }
      if (text === 'true') {
        return { type: 'boolean', value: true, decorate: [] };
      }
      if (text === 'false') {
        return { type: 'boolean', value: false, decorate: [] };
      }
      if (text === 'this') {
        return this.runtime.getThis();
      }
      if (text === 'NaN') {
        return { type: 'number', value: NaN, decorate: [] };
      }
      if (text === 'array') {
        const arrays: unknown[] = [];
        let itemNode = node.right;
        while (itemNode) {
          const { left, operator, right } = itemNode;
          if (operator && operator.type === 'symbol' && operator.text === ',') {
            if (left) {
              arrays.push(this.runtime.exec(left).value);
            }
          } else {
            arrays.push(this.runtime.exec(itemNode).value);
          }
          itemNode = right;
        }
        return { type: 'array', value: arrays, decorate: [] };
      }
    }
    let value: unknown;
    if (text.startsWith("'") && text.endsWith("'")) {
      value = JSON.parse(`"${text.substr(1, text.length - 2)}"`);
    } else if (!tokenResult) {
      try {
        value = JSON.parse(text);
        if (typeof value === 'number' && value.toString() !== text) {
          value = text;
        }
      } catch (ignored) {
        value = text;
      }
    } else {
      value = text;
    }
    return {
      value,
      type: typeof value,
      decorate: []
    };
  }

  private execEnd(node: IExpression): Variable {
    this.runtime.exec(node.left);
    return this.runtime.exec(node.right);
  }

  private execBrackets(node: IExpression): Variable {
    return this.runtime.exec(node.left);
  }

  private execTernary(node: IExpression): Variable {
    const result = this.runtime.exec(node.left).value
      ? this.runtime.exec(node.right!.left)
      : this.runtime.exec(node.right!.right);
    return result;
  }

  private execSet(node: IExpression): Variable {
    return this.runtime.set(node.left!.operator!.text, this.runtime.exec(node.right!));
  }

  private execDefine(node: IExpression): Variable {
    this.runtime.define(node.operator!.text as 'var' | 'let' | 'const');
    const result = this.runtime.exec(node.left);
    this.runtime.define('none');
    return result;
  }

  private operatorDefine(opt: string): (left: Variable, right: Variable) => Variable {
    return (vleft: Variable, vright: Variable) => {
      let value: unknown;
      const left = vleft.value;
      const right = vright.value;
      switch (opt) {
        case '&&':
          if (!left) {
            value = undefined;
            break;
          }
          value = left && right;
          break;
        case '||':
          if (left) {
            value = left;
            break;
          }
          value = left || right;
          break;
        case '===':
        case '==':
          value = left === right;
          break;
        case '!==':
        case '!=':
          value = left !== right;
          break;
        case '>=':
          value = NumberHelper.ge(left, right);
          break;
        case '<=':
          value = NumberHelper.le(left, right);
          break;
        case '>':
          value = NumberHelper.gt(left, right);
          break;
        case '<':
          value = NumberHelper.lt(left, right);
          break;
        case '!':
          value = !right;
          break;
        case '+':
          if (left == null) {
            value = right;
          } else if (right == null) {
            value = left;
          } else if (NumberHelper.isNumericString(left) && NumberHelper.isNumericString(right)) {
            value = NumberHelper.add(left, right);
          } else {
            value = (left as number) + (right as number);
          }
          break;
        case '-':
          if (left == null) {
            value = -(right as number);
          } else if (right == null) {
            value = left;
          } else if (NumberHelper.isNumericString(left) && NumberHelper.isNumericString(right)) {
            value = NumberHelper.subtract(left, right);
          } else {
            value = (left as number) - (right as number);
          }
          break;
        case '*':
          value = NumberHelper.multiply(left as number, right as number);
          break;
        case '/':
          value = NumberHelper.divide(left as number, right as number);
          break;
        case '%':
          value = (left as number) % (right as number);
          break;
        case '^':
          value = (left as number) ^ (right as number);
          break;
        case '>>':
          value = (left as number) >> (right as number);
          break;
        case '<<':
          value = (left as number) << (right as number);
          break;
        case '>>>':
          value = (left as number) >>> (right as number);
          break;
        case '&':
          value = (left as number) & (right as number);
          break;
        case '|':
          value = (left as number) | (right as number);
          break;
        case '~':
          value = ~(right as number);
          break;
        default:
          break;
      }
      return { type: typeof value, value, decorate: [] };
    };
  }

  private execMember(node: IExpression): Variable {
    const obj = this.runtime.exec(node.left).value as Record<string, unknown>;
    const value = obj?.[node.right!.operator!.text];
    return { value, type: typeof value, decorate: [] };
  }

  private execCalculate(node: IExpression) {
    const left = this.runtime.exec(node.left);
    if (node.operator!.text === '&&') {
      if (left.value) {
        const right = this.runtime.exec(node.right);
        return this.runtime.executeOperator(left, right, node.operator!.text);
      }
      return left;
    }
    const right = this.runtime.exec(node.right);
    return this.runtime.executeOperator(left, right, node.operator!.text);
  }

  private execFunctionCall(node: IExpression): Variable {
    const fun = this.runtime.get(node.operator!.text);
    if (fun) {
      const args: Variable[] = [];
      let argnode: IExpression = node.left!;
      if (argnode) {
        if (argnode.type === 'comma') {
          while (argnode) {
            if (
              ['member', 'functionCall', 'logic1', 'logic2', 'logic3', 'calculate1', 'calculate2'].includes(
                argnode.type
              )
            ) {
              args.push(this.runtime.exec(argnode));
              break;
            } else {
              argnode.left ? args.push(this.runtime.exec(argnode.left!)) : args.push(this.runtime.exec(argnode));
              argnode = argnode.right!;
            }
          }
        } else {
          args.push(this.runtime.exec(argnode));
        }
      }
      // args.push(this.runtime.exec(argnode));
      const res = this.runtime.callFunction(fun, args);
      return res;
    }
    return { type: 'undefined', value: undefined, decorate: [] };
  }

  private execSelect(node: IExpression): Variable {
    const obj: Record<string, unknown> = this.runtime.get(node.left!.operator!.text)?.value as Record<string, unknown>;
    let value: unknown;
    if (obj) {
      value = obj[this.runtime.exec(node.right).value as string] as Variable;
    }
    return { value, type: typeof value, decorate: [] };
  }

  private execFunctionDefine(node: IExpression): Variable {
    return {
      value: {
        args: node.left!.operator!.text.split(','),
        handle: () => {
          this.runtime.exec(node.right);
        }
      },
      type: 'function',
      decorate: []
    };
  }

  private execReturn(node: IExpression): Variable {
    const res = this.runtime.exec(node.left);
    return res;
  }

  public constructor() {
    this.lang = new Language(
      [
        this.keywordPatten,
        this.tokenPatten,
        this.numberPatten,
        this.stringPatten,
        this.commentsPatten,
        this.symbolPatten,
        this.blankPatten,
        this.endPatten,
        this.newLinePatten
      ],
      [
        this.blockPatten,
        this.calculateBlockPatten([';', ';\n', '\n'], 'end'),
        this.fullBlockPatten,
        this.defineBlockExpression,
        this.calculateBlockPatten([','], 'comma'),
        this.calculateBlockPatten(['='], 'set'),
        this.ternaryBlockPatten,
        this.functionBlockPatten,
        this.calculateBlockPatten(['&&', '||'], 'logic1'),
        this.calculateBlockPatten(['===', '!==', '==', '!=', '>=', '<=', '>', '<'], 'logic2'),
        this.calculateBlockPatten(['!'], 'logic3'),
        this.calculateBlockPatten(['+', '-'], 'calculate1'),
        this.calculateBlockPatten(['*', '/', '%', '^', '<<', '>>', '|', '&', '~', '>>>'], 'calculate2'),
        this.bracketsBlockPatten,
        this.selectBlockPatten,
        this.arrayVariablePatten,
        this.memberBlockExpression,
        this.functionCallBlockPatten,
        this.returnBlockPatten,
        this.tokenBlockPatten
      ],
      [
        { start: '(', end: ')' },
        { start: '[', end: ']' },
        { start: '{', end: '}' }
      ]
    );
    this.runtime = new Runtime();
    this.runtime.registerExecHandle('variable', this.execVariable.bind(this));
    this.runtime.registerExecHandle('end', this.execEnd.bind(this));
    this.runtime.registerExecHandle('block', this.execEnd.bind(this));
    this.runtime.registerExecHandle('comma', this.execEnd.bind(this));
    this.runtime.registerExecHandle('brackets', this.execBrackets.bind(this));
    this.runtime.registerExecHandle('fullBlock', this.execBrackets.bind(this));
    this.runtime.registerExecHandle('ternary', this.execTernary.bind(this));
    this.runtime.registerExecHandle('set', this.execSet.bind(this));
    this.runtime.registerExecHandle('define', this.execDefine.bind(this));
    this.runtime.registerExecHandle('logic1', this.execCalculate.bind(this));
    this.runtime.registerExecHandle('logic2', this.execCalculate.bind(this));
    this.runtime.registerExecHandle('logic3', this.execCalculate.bind(this));
    this.runtime.registerExecHandle('calculate1', this.execCalculate.bind(this));
    this.runtime.registerExecHandle('calculate2', this.execCalculate.bind(this));
    this.runtime.registerExecHandle('functionCall', this.execFunctionCall.bind(this));
    this.runtime.registerExecHandle('member', this.execMember.bind(this));
    this.runtime.registerExecHandle('select', this.execSelect.bind(this));
    this.runtime.registerExecHandle('functionDefine', this.execFunctionDefine.bind(this));
    this.runtime.registerExecHandle('return', this.execReturn.bind(this));

    this.runtime.registerOperator('*', '*', '&&', this.operatorDefine('&&').bind(this));
    this.runtime.registerOperator('*', '*', '||', this.operatorDefine('||').bind(this));
    this.runtime.registerOperator('*', '*', '===', this.operatorDefine('===').bind(this));
    this.runtime.registerOperator('*', '*', '!==', this.operatorDefine('!==').bind(this));
    this.runtime.registerOperator('*', '*', '==', this.operatorDefine('==').bind(this));
    this.runtime.registerOperator('*', '*', '!=', this.operatorDefine('!=').bind(this));
    this.runtime.registerOperator('*', '*', '>=', this.operatorDefine('>=').bind(this));
    this.runtime.registerOperator('*', '*', '<=', this.operatorDefine('<=').bind(this));
    this.runtime.registerOperator('*', '*', '>', this.operatorDefine('>').bind(this));
    this.runtime.registerOperator('*', '*', '<', this.operatorDefine('<').bind(this));
    this.runtime.registerOperator('*', '*', '!', this.operatorDefine('!').bind(this));
    this.runtime.registerOperator('*', '*', '+', this.operatorDefine('+').bind(this));
    this.runtime.registerOperator('*', '*', '-', this.operatorDefine('-').bind(this));
    this.runtime.registerOperator('*', '*', '*', this.operatorDefine('*').bind(this));
    this.runtime.registerOperator('*', '*', '/', this.operatorDefine('/').bind(this));
    this.runtime.registerOperator('*', '*', '%', this.operatorDefine('%').bind(this));
    this.runtime.registerOperator('*', '*', '&', this.operatorDefine('&').bind(this));
    this.runtime.registerOperator('*', '*', '|', this.operatorDefine('|').bind(this));
    this.runtime.registerOperator('*', '*', '~', this.operatorDefine('~').bind(this));
    this.runtime.registerOperator('*', '*', '^', this.operatorDefine('^').bind(this));
    this.runtime.registerOperator('*', '*', '<<', this.operatorDefine('<<').bind(this));
    this.runtime.registerOperator('*', '*', '>>', this.operatorDefine('>>').bind(this));
    this.runtime.registerOperator('*', '*', '>>>', this.operatorDefine('>>>').bind(this));

    // 数学函数
    this.registerFunction('ABS', ['number|string'], MATH_FUNCTION.ABS);
    this.registerFunction('FLOOR', ['number|string'], MATH_FUNCTION.FLOOR);
    this.registerFunction('CEIL', ['number|string'], MATH_FUNCTION.CEIL);
    this.registerFunction('ROUND', ['number|string'], MATH_FUNCTION.ROUND);
    this.registerFunction('MOD', ['number|string', 'number|string'], MATH_FUNCTION.MOD);
    this.registerFunction('SQRT', ['number|string'], MATH_FUNCTION.SQRT);
    this.registerFunction('SIN', ['number|string'], MATH_FUNCTION.SIN);
    this.registerFunction('COS', ['number|string'], MATH_FUNCTION.COS);
    this.registerFunction('PI', [], () => MATH_FUNCTION.PI);
    this.registerFunction('ADD', ['string|number', 'string|number'], MATH_FUNCTION.ADD);
    this.registerFunction('SUBTRACT', ['number|string', 'number|string'], MATH_FUNCTION.SUBTRACT);
    this.registerFunction('MULTIPLY', ['number|string', 'number|string'], MATH_FUNCTION.MULTIPLY);
    this.registerFunction('DIVIDE', ['number|string', 'number|string'], MATH_FUNCTION.DIVIDE);
    this.registerFunction('MAX', ['number|string', 'number|string'], MATH_FUNCTION.MAX);
    this.registerFunction('MIN', ['number|string', 'number|string'], MATH_FUNCTION.MIN);
    this.registerFunction('SUM', ['array'], MATH_FUNCTION.SUM);
    this.registerFunction('AVG', ['array'], MATH_FUNCTION.AVG);
    this.registerFunction('COUNT', ['array'], MATH_FUNCTION.COUNT);
    this.registerFunction(
      'UPPER_MONEY',
      [(type: any) => (typeof type !== 'number' && typeof type !== 'string' ? 'number|string' : '')],
      MATH_FUNCTION.UPPER_MONEY
    );

    // 字符串函数
    this.registerFunction('TRIM', ['string'], STRING_FUNCTION.TRIM);
    this.registerFunction('IS_BLANK', ['string'], STRING_FUNCTION.IS_BLANK);
    this.registerFunction('STARTS_WITH', ['string', 'string'], STRING_FUNCTION.STARTS_WITH);
    this.registerFunction('ENDS_WITH', ['string', 'string'], STRING_FUNCTION.ENDS_WITH);
    this.registerFunction('CONTAINS', ['string', 'string'], STRING_FUNCTION.CONTAINS);
    // 逗号分隔的字符串数组
    this.registerFunction('STR_LIST_CONTAINS', ['string', 'object', 'string'], STRING_FUNCTION.STR_LIST_CONTAINS);
    this.registerFunction('LOWER', ['string'], STRING_FUNCTION.LOWER);
    this.registerFunction('UPPER', ['string'], STRING_FUNCTION.UPPER);
    this.registerFunction('REPLACE', ['string', 'string', 'string'], STRING_FUNCTION.REPLACE);
    this.registerFunction('LEN', ['string'], STRING_FUNCTION.LEN);
    this.registerFunction('JOIN', ['any', 'any'], STRING_FUNCTION.JOIN);
    this.registerFunction('PARSE', ['string'], STRING_FUNCTION.PARSE);
    this.registerFunction('JSON', ['any'], STRING_FUNCTION.JSON);
    this.registerFunction('SUBSTRING', ['string', 'number', 'number'], STRING_FUNCTION.SUBSTRING);

    // 正则函数
    this.registerFunction('MATCHES', ['string', 'string'], MATCH_FUNCTION.MATCHES);
    this.registerFunction('CHECK_PHONE', ['string'], MATCH_FUNCTION.CHECK_PHONE);
    this.registerFunction('CHECK_EMAIL', ['string'], MATCH_FUNCTION.CHECK_EMAIL);
    this.registerFunction('CHECK_USER_NAME', ['string'], MATCH_FUNCTION.CHECK_USER_NAME);
    this.registerFunction('CHECK_PWD', ['string'], MATCH_FUNCTION.CHECK_PWD);
    this.registerFunction('CHECK_INTEGER', ['string'], MATCH_FUNCTION.CHECK_INTEGER);
    this.registerFunction('CHECK_ID_CARD', ['string'], MATCH_FUNCTION.CHECK_ID_CARD);
    this.registerFunction('CHECK_URL', ['string'], MATCH_FUNCTION.CHECK_URL);
    this.registerFunction('CHECK_CHINESE', ['string'], MATCH_FUNCTION.CHECK_CHINESE);
    this.registerFunction('CHECK_NUMBER', ['string'], MATCH_FUNCTION.CHECK_NUMBER);
    this.registerFunction('CHECK_TWO_DIG', ['string'], MATCH_FUNCTION.CHECK_TWO_DIG);
    this.registerFunction('CHECK_IP', ['string'], MATCH_FUNCTION.CHECK_IP);
    this.registerFunction('CHECK_CONTAINS_CHINESE', ['string'], MATCH_FUNCTION.CHECK_CONTAINS_CHINESE);
    this.registerFunction('CHECK_CODE', ['string'], MATCH_FUNCTION.CHECK_CODE);
    this.registerFunction('CHECK_ENG_NUM', ['string'], MATCH_FUNCTION.CHECK_ENG_NUM);
    this.registerFunction('CHECK_SIZE', ['string', 'number'], MATCH_FUNCTION.CHECK_SIZE);
    this.registerFunction('CHECK_MIN_SIZE', ['string', 'number'], MATCH_FUNCTION.CHECK_MIN_SIZE);
    this.registerFunction('CHECK_MAX_SIZE', ['string', 'number'], MATCH_FUNCTION.CHECK_MAX_SIZE);
    this.registerFunction('CHECK_SIZE_RANGE', ['string', 'number', 'number'], MATCH_FUNCTION.CHECK_SIZE_RANGE);

    // 时间函数
    this.registerFunction('NOW', [], DATETIME_FUNCTION.NOW);
    this.registerFunction('NOW_STR', [], DATETIME_FUNCTION.NOW_STR);
    this.registerFunction('TODAY_STR', [], DATETIME_FUNCTION.TODAY_STR);
    this.registerFunction('TO_DATE', ['string', 'string'], DATETIME_FUNCTION.TO_DATE);
    this.registerFunction('ADD_DAY', ['string', 'number'], DATETIME_FUNCTION.ADD_DAY);
    this.registerFunction('ADD_MONTH', ['string', 'number'], DATETIME_FUNCTION.ADD_MONTH);
    this.registerFunction('ADD_YEAR', ['string', 'number'], DATETIME_FUNCTION.ADD_YEAR);
    this.registerFunction('GREATER_THAN', ['string', 'string'], DATETIME_FUNCTION.GREATER_THAN);
    this.registerFunction('GREATER_EQUAL', ['string', 'string'], DATETIME_FUNCTION.GREATER_EQUAL);
    this.registerFunction('ADD_WORK_DAY', ['string', 'number'], DATETIME_FUNCTION.ADD_WORK_DAY);
    this.registerFunction('COUNT_DAY', ['string', 'string'], DATETIME_FUNCTION.COUNT_DAY);
    this.registerFunction('LESS_THAN', ['string', 'string'], DATETIME_FUNCTION.LESS_THAN);
    this.registerFunction('LESS_EQUAL', ['string', 'string'], DATETIME_FUNCTION.LESS_EQUAL);
    this.registerFunction('DATE_EQUALS', ['string', 'string'], DATETIME_FUNCTION.DATE_EQUALS);

    // 集合(数组)函数
    this.registerFunction('LIST_GET', ['array', 'number'], COLLECTION_FUNCTION.LIST_GET);
    this.registerFunction('LIST_IS_EMPTY', ['array'], COLLECTION_FUNCTION.LIST_IS_EMPTY);
    this.registerFunction('LIST_CONTAINS', ['array', 'any'], COLLECTION_FUNCTION.LIST_CONTAINS);
    this.registerFunction('LIST_ADD', ['array', 'any'], COLLECTION_FUNCTION.LIST_ADD);
    this.registerFunction('LIST_ADD_BY_INDEX', ['array', 'number', 'any'], COLLECTION_FUNCTION.LIST_ADD_BY_INDEX);
    this.registerFunction('LIST_REMOVE', ['array', 'any'], COLLECTION_FUNCTION.LIST_REMOVE);
    this.registerFunction('LIST_COUNT', ['array'], COLLECTION_FUNCTION.LIST_COUNT);
    this.registerFunction('LIST_IDS', ['array'], COLLECTION_FUNCTION.LIST_IDS);
    this.registerFunction('LIST_FIELD_VALUES', ['array', 'string', 'string'], COLLECTION_FUNCTION.LIST_FIELD_VALUES);
    this.registerFunction(
      'LIST_FIELD_EQUALS',
      ['array', 'string', 'string', 'any'],
      COLLECTION_FUNCTION.LIST_FIELD_EQUALS
    );
    this.registerFunction(
      'LIST_FIELD_NOT_EQUALS',
      ['array', 'string', 'string', 'any'],
      COLLECTION_FUNCTION.LIST_FIELD_NOT_EQUALS
    );
    this.registerFunction('LIST_FIELD_IN', ['array', 'string', 'string', 'array'], COLLECTION_FUNCTION.LIST_FIELD_IN);
    this.registerFunction(
      'LIST_FIELD_NOT_IN',
      ['array', 'string', 'string', 'array'],
      COLLECTION_FUNCTION.LIST_FIELD_NOT_IN
    );
    this.registerFunction('LIST_AND', ['array'], COLLECTION_FUNCTION.LIST_AND);
    this.registerFunction('LIST_OR', ['array'], COLLECTION_FUNCTION.LIST_OR);
    this.registerFunction('STRING_LIST_TO_NUMBER_LIST', ['array'], COLLECTION_FUNCTION.STRING_LIST_TO_NUMBER_LIST);
    this.registerFunction('COMMA', ['array'], COLLECTION_FUNCTION.COMMA);
    this.registerFunction('CONCAT', ['array', 'string'], COLLECTION_FUNCTION.CONCAT);
    this.registerFunction('MAP_GET', ['object', 'string'], COLLECTION_FUNCTION.MAP_GET);
    this.registerFunction('MAP_IS_EMPTY', ['object'], COLLECTION_FUNCTION.MAP_IS_EMPTY);
    this.registerFunction('MAP_CONTAINS_KEY', ['object', 'string'], COLLECTION_FUNCTION.MAP_CONTAINS_KEY);
    this.registerFunction('MAP_PUT', ['object', 'string', 'any'], COLLECTION_FUNCTION.MAP_PUT);
    this.registerFunction('MAP_REMOVE', ['object', 'string'], COLLECTION_FUNCTION.MAP_REMOVE);
    this.registerFunction('MAP_COUNT', ['object'], COLLECTION_FUNCTION.MAP_COUNT);
    // 对象函数
    this.registerFunction('IS_NULL', ['any'], OBJECT_FUNCTION.IS_NULL);
    this.registerFunction('EQUALS', ['object', 'object'], OBJECT_FUNCTION.EQUALS);
    this.registerFunction('GET', ['object', 'string'], OBJECT_FUNCTION.GET);
    this.registerFunction('FIELD_GET', ['object', 'string', 'string'], OBJECT_FUNCTION.FIELD_GET);
    // 逻辑函数
    this.registerFunction('IF', ['boolean', 'any', 'any'], LOGIC_FUNCTION.IF);
    this.registerFunction('AND', ['boolean', 'boolean'], LOGIC_FUNCTION.AND);
    this.registerFunction('OR', ['boolean', 'boolean'], LOGIC_FUNCTION.OR);
    this.registerFunction('NOT', ['boolean'], LOGIC_FUNCTION.NOT);
    // 转换函数
    /**
     * @deprecated please use TO_NUMBER
     */
    this.registerFunction('ToNumber', ['any'], CONVERT_FUNCTION.TO_NUMBER);
    this.registerFunction('TO_NUMBER', ['any'], CONVERT_FUNCTION.TO_NUMBER);
  }

  public compile(source: string): ITokenTree | undefined {
    return this.lang.compile(source);
  }

  public rawExec(node: ITokenTree): unknown {
    return this.runtime.exec(node).value;
  }

  public exec(source: string) {
    // FIXME 全中文、符号直接返回
    if (/^[\u4e00-\u9fa5]+$/.test(source) || symbols.includes(source)) {
      return source;
    }
    let node: ITokenTree | undefined;
    try {
      node = this.compile(source);
      if (node?.type === 'unknown') {
        return source;
      }
    } catch (ignored) {
      return source;
    }
    if (!node) {
      return source;
    }
    try {
      return this.rawExec(node);
    } catch (e) {
      console.error(`无法解析表达式:${source}`, e);
      throw e;
    }
  }

  public getRuntime() {
    return this.runtime;
  }

  private static instance = new Expression();

  public static getInstance = () => Expression.instance;

  public registerFunction(name: string, argTypes: unknown[], handle: Function) {
    this.runtime.define('const');
    this.runtime.set(name, {
      type: 'function',
      decorate: [],
      value: {
        handle: () => {
          const args = this.runtime.get('arguments')!.value as unknown[];

          if (argTypes.length) {
            if (args.length < argTypes.length) {
              throw new Error(`函数${name}需要${argTypes.length}个参数，现在得到${args.length}个`);
            }

            args.forEach((arg, index) => {
              if (arg == null) {
                return;
              }
              const requireType = argTypes[index];
              if (typeof requireType === 'string') {
                const requireTypes = requireType.split('|');
                if (
                  Array.isArray(arg)
                    ? !requireTypes.includes('array') && !requireTypes.includes('any')
                    : !requireTypes.includes(typeof arg) && !requireTypes.includes('any')
                ) {
                  throw new Error(`函数${name}第${index}为${requireType}类型,现在为${typeof arg}类型`);
                }
              } else if (typeof requireType === 'function') {
                const needType = requireType(typeof arg);
                if (needType !== '') {
                  throw new Error(`函数${name}第${index}为${needType}类型,现在为${typeof arg}类型`);
                }
              }
            });
          }

          return handle.call(undefined, ...args);
        },
        args: argTypes.map((t, index) => `$${index}${t}`)
      }
    });
    this.runtime.define('none');
  }

  public initExpressionContext(
    activeRecords: Record<string, unknown>[] = [{}],
    rootRecord: Record<string, unknown> = {},
    openerRecord: Record<string, unknown> = {},
    scene: string | null,
    activeRecord?: Record<string, unknown> | null,
    parentRecord?: Record<string, unknown> | null
  ) {
    const runtime = Expression.getInstance().getRuntime();
    activeRecord = !activeRecord ? activeRecords[0] || {} : activeRecord;
    runtime.define('let');
    runtime.set('context', {
      type: 'object',
      decorate: [],
      value: {
        activeRecord,
        activeRecords,
        rootRecord,
        parentRecord
      }
    });
    runtime.set('activeRecord', {
      type: 'object',
      decorate: [],
      value: activeRecord
    });
    runtime.set('activeRecords', {
      type: 'object',
      decorate: [],
      value: activeRecords
    });
    runtime.set('rootRecord', {
      type: 'object',
      decorate: [],
      value: rootRecord
    });
    runtime.set('scene', {
      type: 'string',
      decorate: [],
      value: scene
    });
    runtime.set('openerRecord', {
      type: 'object',
      decorate: [],
      value: openerRecord
    });

    runtime.set('parentRecord', {
      type: 'object',
      decorate: [],
      value: parentRecord
    });

    runtime.define('none');
  }

  public cleanupExpressionContext(activeRecord?: Record<string, unknown>) {
    const runtime = Expression.getInstance().getRuntime();
    runtime.set('context', {
      type: 'null',
      decorate: [],
      value: null
    });
    runtime.set('activeRecord', {
      type: 'null',
      decorate: [],
      value: null
    });
    runtime.set('activeRecords', {
      type: 'null',
      decorate: [],
      value: null
    });
    runtime.set('rootRecord', {
      type: 'null',
      decorate: [],
      value: null
    });
    runtime.set('openerRecord', {
      type: 'null',
      decorate: [],
      value: null
    });
    runtime.set('scene', {
      type: 'null',
      decorate: [],
      value: null
    });
    runtime.set('parentRecord', {
      type: 'null',
      decorate: [],
      value: null
    });
  }

  public static run<T>(param: ExpressionRunParam, expression: string, errorValue?: T): T | string | undefined {
    return SPI.RawInstantiate(ExpressionExecutorServiceToken)?.run(param, expression, errorValue);
  }

  /**
   * 是否有表达式的内置关键字
   * 注意：字符串的true、false需要通过表达式转换才能变成布尔类型的，布尔类型的地方不要用此方法判断，像field.label这种字符串类型的可以用
   * @param expression
   * @private
   */
  public static hasKeywords(expression: string) {
    if (!expression) {
      return false;
    }
    for (const key in ExpressionKeyword) {
      if (expression.includes(ExpressionKeyword[key] as string)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取表达式的真实字符串，为提高性能，将表达式用${}包裹
   * @param expression
   */
  public static getExpressionStr(expression: string) {
    if (!this.isExpressionStr(expression)) {
      return expression;
    }
    return expression.substr(2, expression.length - 3);
  }

  public static isExpressionStr(expression: string) {
    return expression?.startsWith('${');
  }
}
