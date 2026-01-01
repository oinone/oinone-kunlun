import { BooleanHelper } from '../../BooleanHeler';
import { NumberHelper } from '../../NumberHelper';
import { type RSQLConditionNodeInfo, RSQLNodeInfo } from '../RSQLNodeInfo';
import { RSQLLogicalOperator } from '../RSQLOperator';

export interface NodeConnector<T> {
  logicConnector(type: RSQLLogicalOperator, values: string[]): string | undefined;

  comparisonConnector(nodeInfo: T): string | undefined;
}

export class RSQLConditionConnector<T extends RSQLConditionNodeInfo> implements NodeConnector<T> {
  protected constructor() {}

  public static INSTANCE = new RSQLConditionConnector<RSQLConditionNodeInfo>();

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

  public comparisonConnector(nodeInfo: T): string | undefined {
    const { selector, operator, args } = nodeInfo;
    const len = args?.length;
    if (!len) {
      return undefined;
    }
    let arg: string;
    const finalQuote = this.quote(nodeInfo, args[0]);
    if (operator!.isMulti) {
      arg = `(${finalQuote}${args!.join(`${finalQuote}, ${finalQuote}`)}${finalQuote})`;
    } else {
      arg = `${finalQuote}${args[0]}${finalQuote}`;
    }
    return `${selector} ${operator!.symbol} ${arg}`;
  }

  protected quote(nodeInfo: T, arg: string): string {
    const { quote } = nodeInfo;
    if (quote == null) {
      const finalQuote = this.defaultQuote(nodeInfo, arg);
      if (finalQuote != null) {
        return finalQuote;
      }
    } else if (quote === true) {
      return "'";
    } else if (quote !== false) {
      return quote;
    }
    return '';
  }

  protected defaultQuote(nodeInfo: T, arg: string): string | undefined {
    if (!NumberHelper.isNumber(arg) && arg !== BooleanHelper.TRUE_STRING && arg !== BooleanHelper.FALSE_STRING) {
      const fc = arg.charAt(0);
      const lc = arg.charAt(arg.length - 1);
      if (fc !== "'" && lc !== "'" && fc !== '"' && lc !== '"') {
        return "'";
      }
    }
    return undefined;
  }
}

export class RSQLNodeConnector extends RSQLConditionConnector<RSQLNodeInfo> implements NodeConnector<RSQLNodeInfo> {
  protected constructor() {
    super();
  }

  public static INSTANCE = new RSQLNodeConnector();

  protected defaultQuote(nodeInfo: RSQLNodeInfo, arg: string): string | undefined {
    let ttype = nodeInfo.field?.ttype;
    if (ttype === 'RELATED') {
      ttype = nodeInfo.field?.relatedTtype;
    }
    if (!ttype) {
      return super.defaultQuote(nodeInfo, arg);
    }
    if (this.hasQuote(ttype)) {
      const fc = arg.charAt(0);
      const lc = arg.charAt(arg.length - 1);
      if (fc !== "'" && lc !== "'" && fc !== '"' && lc !== '"') {
        return "'";
      }
    }
    return undefined;
  }

  protected hasQuote(ttype: string): boolean {
    return ['STRING', 'TEXT', 'HTML', 'PHONE', 'EMAIL', 'DATETIME', 'DATE', 'TIME', 'YEAR'].includes(ttype);
  }
}
