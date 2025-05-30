import { RSQLComparisonOperator, RSQLLogicalOperator } from '../RSQLOperator';
import { RSQLAndNode, RSQLComparisonNode, RSQLLogicalNode, RSQLNode, RSQLOrNode } from './RSQLNode';

export class RSQLNodeFactory {
  private comparisonOperators: Record<string, RSQLComparisonOperator>;

  public constructor(operators: Set<RSQLComparisonOperator>) {
    const comparisonOperators = {};
    for (const operator of operators) {
      for (const symbol of operator.symbols) {
        comparisonOperators[symbol] = operator;
      }
    }
    this.comparisonOperators = comparisonOperators;
  }

  public createLogicNode(operator: RSQLLogicalOperator, children: RSQLNode[]): RSQLLogicalNode | undefined {
    switch (operator) {
      case RSQLLogicalOperator.AND:
        return new RSQLAndNode(children);
      case RSQLLogicalOperator.OR:
        return new RSQLOrNode(children);
      default:
        return undefined;
    }
  }

  public createComparisonNode(
    operatorString: string,
    selector: string,
    args: string[]
  ): RSQLComparisonNode | undefined {
    const operator = this.comparisonOperators[operatorString];
    if (operator) {
      return new RSQLComparisonNode(operator, selector, args);
    }
  }
}
