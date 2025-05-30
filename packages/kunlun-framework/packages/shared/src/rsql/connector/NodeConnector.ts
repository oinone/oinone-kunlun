import { NumberHelper } from '../../NumberHelper';
import { RSQLNodeInfo } from '../RSQLNodeInfo';
import { RSQLLogicalOperator } from '../RSQLOperator';

export interface NodeConnector {
  logicConnector(type: RSQLLogicalOperator, values: string[]): string | undefined;

  comparisonConnector(nodeInfo: RSQLNodeInfo): string | undefined;
}

export class RSQLNodeConnector implements NodeConnector {
  private constructor() {}

  public static INSTANCE = new RSQLNodeConnector();

  public logicConnector(type: RSQLLogicalOperator, values: string[]): string | undefined {
    const len = values.length;
    if (!len) {
      return undefined;
    }
    if (values.length === 1) {
      return values[0];
    }
    return `(${values.join(` ${type} `)})`;
  }

  public comparisonConnector(nodeInfo: RSQLNodeInfo): string | undefined {
    const { selector, operator, args } = nodeInfo;
    const len = args?.length;
    if (!len) {
      return undefined;
    }
    let arg: string;
    if (len === 1) {
      [arg] = args;
      if (!NumberHelper.isNumber(arg)) {
        arg = `'${arg}'`;
      }
    } else {
      arg = `('${args!.join(`', '`)}')`;
    }
    return `${selector}${operator!.symbol}${arg}`;
  }
}
