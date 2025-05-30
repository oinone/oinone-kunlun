export interface IPattern<T, K> {
  name: string;
  test: (input: T) => number;
  parse?: (input: T) => K;
  avalible?: boolean;
}

export interface IToken {
  text: string;
  type: string;
  avalible: boolean;
}

export interface IBrackets {
  start: string;
  end: string;
}

export interface IExpression {
  left?: IExpression;
  right?: IExpression;
  operator?: IToken;
  type: string;
}

export enum ExpressionKeyword {
  activeRecords = 'activeRecords',
  activeRecord = 'activeRecord',
  rootRecord = 'rootRecord',
  openerRecord = 'openerRecord',
  scene = 'scene'
}

export type ITokenTree = IExpression;

export class Language {
  private readonly wordPatterns: IPattern<string, string>[] = [];

  private readonly expressionPatterns: IPattern<IToken[], IExpression>[] = [];

  private brackets: IBrackets[] = [];

  private bracketsFlags: number[] = [];

  public constructor(
    wordPatterns: IPattern<string, string>[],
    expressionPatterns: IPattern<IToken[], IExpression>[],
    brackets: IBrackets[]
  ) {
    this.wordPatterns = wordPatterns;
    this.expressionPatterns = expressionPatterns;
    this.brackets = brackets;
  }

  public lex(text: string): IToken {
    const res: IToken = { type: 'unknown', text: '', avalible: false };
    for (const wp of this.wordPatterns) {
      const wplength = wp.test(text);
      if (wplength > res.text.length) {
        res.text = (wp.parse && wp.parse(text.substr(0, wplength))) || text.substr(0, wplength);
        res.avalible = wp.avalible !== false;
        res.type = wp.name;
        break;
      }
    }
    if (res.text.length === 0) {
      throw new Error(`unknown source:${text}`);
    }
    return res;
  }

  public parseExpression(tokens: IToken[]): IExpression | undefined {
    if (tokens.length === 0) {
      return undefined;
    }
    let res: IExpression = { type: 'unknown' };
    let length = 0;
    let source = tokens;
    for (let i = 0; i < this.expressionPatterns.length; i++) {
      const eplength = this.expressionPatterns[i].test(tokens);
      if (eplength > length) {
        const { parse } = this.expressionPatterns[i];
        if (parse) {
          res = parse(source.slice(0, eplength));
          length = eplength;
          source = source.slice(eplength);
        }
      }
    }
    return res;
  }

  public compile(text: string): ITokenTree | undefined {
    let source = text;
    const tokens: IToken[] = [];
    while (source.length > 0) {
      const token = this.lex(source);
      source = source.substring(token.text.length);
      tokens.push(token);
    }
    return this.parseExpression(tokens.filter((t) => t.avalible));
  }

  public checkToken(tokenString: string, tokens: IToken[]) {
    this.cleanBrancketsFlags();
    for (let ti = 0; ti < tokens.length; ti++) {
      for (let i = 0; i < this.brackets.length; i++) {
        if (tokens[ti].text === this.brackets[i].start) {
          this.bracketsFlags[i]++;
        }
        if (tokens[ti].text === this.brackets[i].end) {
          this.bracketsFlags[i]--;
        }
      }
      if (tokens[ti].text === tokenString) {
        let flag = true;
        for (let i = 0; i < this.bracketsFlags.length; i++) {
          if (this.bracketsFlags[i] !== 0) {
            flag = false;
            break;
          }
        }
        if (flag) {
          return ti;
        }
      }
    }
    return -1;
  }

  public cleanBrancketsFlags() {
    for (let i = 0; i < this.brackets.length; i++) {
      this.bracketsFlags[i] = 0;
    }
  }
}
