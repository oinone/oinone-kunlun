import { IExpression } from '../language';

export interface Variable {
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined' | 'function' | 'bigint' | 'symbol';
  decorate: string[];
}
export class Runtime {
  private stack: Map<string, Variable>[] = [];

  private global: Map<string, Variable> = new Map();

  private ctx: Map<string, Variable> = this.global;

  private lastValue: Variable = { value: null, type: 'null', decorate: [] };

  private thisValue: Variable = { value: {}, type: 'object', decorate: [] };

  private execHandles: Map<string, (node: IExpression) => Variable> = new Map();

  private operatorHandles: Map<string, (left: Variable, right: Variable) => Variable> = new Map();

  private defineType: 'var' | 'const' | 'let' | 'none' = 'none';

  private next: IExpression | null = null;

  public registerExecHandle(type: string, handle: (node: IExpression) => Variable) {
    this.execHandles.set(type, handle);
  }

  public registerOperator(
    left: string,
    right: string,
    operator: string,
    handle: (left: Variable, right: Variable) => Variable
  ) {
    this.operatorHandles.set(JSON.stringify({ left, right, operator }), handle);
  }

  public executeOperator(left: Variable, right: Variable, operator: string): Variable {
    const opt =
      this.operatorHandles.get(JSON.stringify({ left: left.type, right: right.type, operator })) ||
      this.operatorHandles.get(JSON.stringify({ left: '*', right: '*', operator }));
    if (opt) {
      return opt(left, right);
    }
    return { value: undefined, type: 'undefined', decorate: [] };
  }

  public set(name: string, value: Variable) {
    const oldValue = this.get(name);
    if (oldValue) {
      if (!oldValue.decorate.includes('const')) {
        oldValue.value = value.value;
        oldValue.type = value.type;
      }
    } else if (this.defineType !== 'none') {
      this.ctx.set(name, {
        value: value.value,
        type: value.type,
        decorate: [this.defineType]
      });
    }
    return value;
  }

  public get(name: string): Variable | undefined {
    return this.ctx.get(name) || this.global.get(name);
  }

  public exec(node?: IExpression) {
    if (node) {
      if (node.type !== 'unknown') {
        const handle = this.execHandles.get(node.type);
        if (handle) {
          this.lastValue = handle(node);
        }
      } else {
        this.lastValue = { value: null, type: 'null', decorate: [] };
      }
    }
    return this.lastValue;
  }

  public define(type: 'var' | 'const' | 'let' | 'none') {
    this.defineType = type;
  }

  public getThis() {
    return this.thisValue;
  }

  public callFunction(fun: Variable, args: Variable[]) {
    const funBlock = fun.value as {
      args: string[];
      handle: () => unknown;
    };
    const newCtx = new Map<string, Variable>();
    funBlock.args.forEach((n, index) => newCtx.set(n, args[index]));
    newCtx.set('arguments', {
      value: args.map((a) => a.value),
      type: 'array',
      decorate: []
    });
    this.stack.push(this.ctx);
    this.ctx = newCtx;
    this.lastValue = { value: undefined, type: 'undefined', decorate: [] };
    const res = funBlock.handle();
    this.ctx = this.stack.pop()!;
    // if (res) {
    this.lastValue.value = res;
    this.lastValue.type = typeof res;
    // }
    return this.lastValue;
  }
}
