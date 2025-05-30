export interface TokenTypeOptions {
  before: boolean;
  start: boolean;
  binop: number;
}

export class TokenType {
  public readonly keyword: string;

  public readonly before: boolean;

  public readonly start: boolean;

  public readonly binop: number | undefined;

  public constructor(keyword: string, options?: Partial<TokenTypeOptions>) {
    this.keyword = keyword;
    this.before = !!options?.before;
    this.start = !!options?.start;
    this.binop = options?.binop;
  }
}

export interface Token {
  type: TokenType;
  start: number;
  end: number;

  text: string;
}
