import { isArray, isNumber } from 'lodash-es';
import { BooleanHelper } from '../../BooleanHeler';
import { DateUtil, defaultFormat, defaultTimeFormat } from '../../date';
import { NumberHelper } from '../../NumberHelper';
import { RSQLConditionNodeInfo, RSQLNodeInfo } from '../RSQLNodeInfo';

export interface NodeComputer<N, T> {
  comparisonCompute(nodeInfo: N, data: T): boolean;
}

export class RSQLConditionComputer<N extends RSQLConditionNodeInfo, T extends object = object>
  implements NodeComputer<N, T>
{
  public comparisonCompute(nodeInfo: N, data: T): boolean {
    const { selector, operator, args } = nodeInfo;
    const val = this.getValue(data, selector!);
    switch (operator!.symbol) {
      case '=isnull=': {
        const isNull = BooleanHelper.toBoolean(args![0]);
        if (isNull) {
          return this.isNull(val);
        }
        return this.isNotNull(val);
      }
      case '=notnull=': {
        const isNotNull = BooleanHelper.toBoolean(args![0]);
        if (isNotNull) {
          return this.isNotNull(val);
        }
        return this.isNull(val);
      }
    }
    if (operator!.isMulti) {
      const values = this.resolveValues(nodeInfo, val);
      switch (operator!.symbol) {
        case '=in=':
          return this.computeIn(nodeInfo, args!, values);
        case '=out=':
          return this.computeOut(nodeInfo, args!, values);
        case '=bit=':
          return this.computeBit(nodeInfo, args!, values);
        case '=notbit=':
          return this.computeNotBit(nodeInfo, args!, values);
        case '=has=':
          return this.computeHas(nodeInfo, args!, values);
        case '=hasnt=':
          return this.computeHasnt(nodeInfo, args!, values);
        case '=hasor=':
          return this.computeHasor(nodeInfo, args!, values);
        case '=hasntor=':
          return this.computeHasntor(nodeInfo, args!, values);
      }
    }
    switch (operator!.symbol) {
      case '==':
        return this.computeEq(nodeInfo, args![0], val);
      case '!=':
        return this.computeNe(nodeInfo, args![0], val);
      case '=like=':
        return this.computeLike(nodeInfo, args![0], val);
      case '=starts=':
        return this.computeStarts(nodeInfo, args![0], val);
      case '=ends=':
        return this.computeEnds(nodeInfo, args![0], val);
      case '=notlike=':
        return this.computeNotLike(nodeInfo, args![0], val);
      case '=notstarts=':
        return this.computeNotStarts(nodeInfo, args![0], val);
      case '=notends=':
        return this.computeNotEnds(nodeInfo, args![0], val);
      case '=gt=':
        return this.computeGt(nodeInfo, args![0], val);
      case '=ge=':
        return this.computeGe(nodeInfo, args![0], val);
      case '=lt=':
        return this.computeLt(nodeInfo, args![0], val);
      case '=le=':
        return this.computeLe(nodeInfo, args![0], val);
      case '=cole=':
        return this.computeCole(nodeInfo, args![0], val);
      case '=colnot=':
        return this.computeColnot(nodeInfo, args![0], val);
    }
    console.error('Invalid operator symbol.', nodeInfo, data);
    return false;
  }

  protected isNull(val: unknown): boolean {
    return val == null || val === '';
  }

  protected isNotNull(val: unknown): boolean {
    return val != null && val !== '';
  }

  protected computeIn(nodeInfo: N, origin: string[], inputs: string[]): boolean {
    const set = new Set(origin);
    for (const input of inputs) {
      if (set.has(input)) {
        return true;
      }
    }
    return false;
  }

  protected computeOut(nodeInfo: N, origin: string[], inputs: string[]): boolean {
    const set = new Set(origin);
    for (const input of inputs) {
      if (set.has(input)) {
        return false;
      }
    }
    return true;
  }

  protected computeBit(nodeInfo: N, origin: string[], inputs: string[]): boolean {
    const set = new Set(origin);
    return inputs.filter((v) => !set.has(v)).length === 0;
  }

  protected computeNotBit(nodeInfo: N, origin: string[], inputs: string[]): boolean {
    return !this.computeBit(nodeInfo, origin, inputs);
  }

  protected computeHas(nodeInfo: N, origin: string[], inputs: string[]): boolean {
    const set = new Set(inputs);
    return origin.filter((v) => set.has(v)).length === origin.length;
  }

  protected computeHasnt(nodeInfo: N, origin: string[], inputs: string[]): boolean {
    return !this.computeHas(nodeInfo, origin, inputs);
  }

  protected computeHasor(nodeInfo: N, origin: string[], inputs: string[]): boolean {
    const set = new Set(inputs);
    return origin.filter((v) => set.has(v)).length >= 1;
  }

  protected computeHasntor(nodeInfo: N, origin: string[], inputs: string[]): boolean {
    return !this.computeHasor(nodeInfo, origin, inputs);
  }

  protected computeEq(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    if (isArray(input)) {
      return input.map((v) => `${v}`).includes(origin);
    }
    return origin === `${input}`;
  }

  protected computeNe(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return true;
    }
    if (isArray(input)) {
      return !input.map((v) => `${v}`).includes(origin);
    }
    return origin !== `${input}`;
  }

  protected computeLike(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    if (isArray(input)) {
      return input.map((v) => `${v}`).filter((v) => v.indexOf(origin) >= 0).length >= 1;
    }
    return `${input}`.indexOf(origin) >= 0;
  }

  protected computeStarts(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    if (isArray(input)) {
      return input.map((v) => `${v}`).filter((v) => v.startsWith(origin)).length >= 1;
    }
    return `${input}`.startsWith(origin);
  }

  protected computeEnds(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    if (isArray(input)) {
      return input.map((v) => `${v}`).filter((v) => v.endsWith(origin)).length >= 1;
    }
    return `${input}`.endsWith(origin);
  }

  protected computeNotLike(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    if (isArray(input)) {
      return input.map((v) => `${v}`).filter((v) => v.indexOf(origin) === -1).length >= 1;
    }
    return `${input}`.indexOf(origin) === -1;
  }

  protected computeNotStarts(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    if (isArray(input)) {
      return input.map((v) => `${v}`).filter((v) => !v.startsWith(origin)).length >= 1;
    }
    return !`${input}`.startsWith(origin);
  }

  protected computeNotEnds(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    if (isArray(input)) {
      return input.map((v) => `${v}`).filter((v) => !v.endsWith(origin)).length >= 1;
    }
    return !`${input}`.endsWith(origin);
  }

  protected computeGt(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    const res = this.resolveNumber(nodeInfo, origin, input);
    if (res == null) {
      return false;
    }
    const { a, b } = res;
    return a > b;
  }

  protected computeGe(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    const res = this.resolveNumber(nodeInfo, origin, input);
    if (res == null) {
      return false;
    }
    const { a, b } = res;
    return a >= b;
  }

  protected computeLt(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    const res = this.resolveNumber(nodeInfo, origin, input);
    if (res == null) {
      return false;
    }
    const { a, b } = res;
    return a < b;
  }

  protected computeLe(nodeInfo: N, origin: string, input: unknown): boolean {
    if (this.isNull(input)) {
      return false;
    }
    const res = this.resolveNumber(nodeInfo, origin, input);
    if (res == null) {
      return false;
    }
    const { a, b } = res;
    return a <= b;
  }

  protected computeCole(nodeInfo: N, origin: string, input: unknown): boolean {
    return this.computeEq(nodeInfo, origin, input);
  }

  protected computeColnot(nodeInfo: N, origin: string, input: unknown): boolean {
    return this.computeNe(nodeInfo, origin, input);
  }

  protected getValue(data: T, selector: string): unknown {
    if (selector === '1') {
      return '1';
    }
    const fields = selector.split('.');
    const firstField = fields[0];
    let value = data[firstField];
    if (value == null || fields.length === 1) {
      return value;
    }
    for (let i = 1; i < fields.length; i++) {
      const field = fields[i];
      if (isArray(value)) {
        value = value.map((v) => v[field]);
      } else {
        value = value[field];
      }
      if (value == null) {
        break;
      }
    }
    return value;
  }

  protected resolveValues(nodeInfo: N, data: unknown): string[] {
    if (data == null) {
      return [];
    }
    if (isArray(data)) {
      return data.map((v) => `${v}`);
    }
    return [`${data}`];
  }

  protected resolveNumber(nodeInfo: N, origin: string, input: unknown): { a: number; b: number } | undefined {
    let a: number | null | undefined;
    let b: number | null | undefined;
    if (input instanceof Date) {
      a = input.getTime();
      b = DateUtil.toDate(origin, defaultFormat).getTime();
      if (Number.isNaN(b)) {
        b = DateUtil.toDate(origin, defaultTimeFormat).getTime();
      }
    } else if (isNumber(input)) {
      a = input;
      b = NumberHelper.toNumber(origin);
    } else {
      b = NumberHelper.toNumber(origin);
      if (b == null) {
        b = DateUtil.toDate(origin, defaultFormat).getTime();
        if (Number.isNaN(b)) {
          b = DateUtil.toDate(origin, defaultTimeFormat).getTime();
          a = DateUtil.toDate(`${input}`, defaultTimeFormat).getTime();
        } else {
          a = DateUtil.toDate(`${input}`, defaultFormat).getTime();
        }
      } else {
        a = NumberHelper.toNumber(`${input}`);
      }
    }
    if (a == null || b == null || Number.isNaN(a) || Number.isNaN(b)) {
      return undefined;
    }
    return { a, b };
  }
}

export class RSQLNodeComputer<T extends object = object>
  extends RSQLConditionComputer<RSQLNodeInfo, T>
  implements NodeComputer<RSQLNodeInfo, T>
{
  public static INSTANCE: NodeComputer<RSQLNodeInfo, Record<string, unknown>> = new RSQLNodeComputer();

  protected computeEq(nodeInfo: RSQLNodeInfo, origin: string, input: unknown): boolean {
    const ttype = this.getTtype(nodeInfo);
    if (!ttype) {
      return super.computeEq(nodeInfo, origin, input);
    }
    if (this.isNumberTtype(ttype)) {
      const res = this.resolveNumber(nodeInfo, origin, input);
      if (res == null) {
        return false;
      }
      const { a, b } = res;
      return a === b;
    }
    return super.computeEq(nodeInfo, origin, input);
  }

  protected computeNe(nodeInfo: RSQLNodeInfo, origin: string, input: unknown): boolean {
    const ttype = this.getTtype(nodeInfo);
    if (!ttype) {
      return super.computeEq(nodeInfo, origin, input);
    }
    if (this.isNumberTtype(ttype)) {
      const res = this.resolveNumber(nodeInfo, origin, input);
      if (res == null) {
        return false;
      }
      const { a, b } = res;
      return a !== b;
    }
    return super.computeNe(nodeInfo, origin, input);
  }

  protected resolveNumber(
    nodeInfo: RSQLNodeInfo,
    origin: string,
    input: unknown
  ):
    | {
        a: number;
        b: number;
      }
    | undefined {
    const ttype = this.getTtype(nodeInfo);
    if (!ttype) {
      return super.resolveNumber(nodeInfo, origin, input);
    }
    let a: number | null | undefined;
    let b: number | null | undefined;
    switch (ttype) {
      case 'STRING':
        return super.resolveNumber(nodeInfo, origin, input);
      case 'INTEGER':
      case 'LONG':
      case 'FLOAT':
      case 'MONEY':
        if (isNumber(input)) {
          a = input;
        } else {
          a = NumberHelper.toNumber(`${input}`);
        }
        b = NumberHelper.toNumber(origin);
        break;
      case 'DATETIME':
      case 'DATE':
      case 'YEAR':
        if (input instanceof Date) {
          a = input.getTime();
        } else {
          a = DateUtil.toDate(`${input}`, defaultFormat).getTime();
        }
        b = DateUtil.toDate(origin, defaultFormat).getTime();
        break;
      case 'TIME':
        if (input instanceof Date) {
          a = input.getTime();
        } else {
          a = DateUtil.toDate(`${input}`, defaultTimeFormat).getTime();
        }
        b = DateUtil.toDate(origin, defaultTimeFormat).getTime();
        break;
    }
    if (a == null || b == null || Number.isNaN(a) || Number.isNaN(b)) {
      return undefined;
    }
    return { a, b };
  }

  protected getTtype(nodeInfo: RSQLNodeInfo) {
    let ttype = nodeInfo.field?.ttype;
    if (ttype === 'RELATED') {
      ttype = nodeInfo.field?.relatedTtype;
    }
    return ttype;
  }

  protected isNumberTtype(ttype: string): boolean {
    return ['INTEGER', 'LONG', 'FLOAT', 'MONEY'].includes(ttype);
  }
}
