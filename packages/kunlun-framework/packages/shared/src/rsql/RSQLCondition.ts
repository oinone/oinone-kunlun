import { BooleanHelper } from '../BooleanHeler';
import { TreeNode } from '../tree-node';
import { RSQLHelper } from './RSQLHelper';
import { RSQLConditionNodeInfo, RSQLNodeInfo, RSQLNodeInfoType, RSQLQuote } from './RSQLNodeInfo';
import { RSQLComparisonOperator, RSQLOperators } from './RSQLOperator';

export class RSQLCondition {
  private counter: number;

  private readonly root: TreeNode<RSQLConditionNodeInfo>;

  private constructor(root?: TreeNode<RSQLConditionNodeInfo>, counter?: number) {
    this.root = root || this.generatorNode(RSQLNodeInfo.newNodeInfo(RSQLNodeInfoType.AND));
    this.counter = counter || 0;
  }

  public eq(field: string, value: string | number | boolean | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.EQUAL, value, quote));
    return this.swapAnd();
  }

  public ne(field: string, value: string | number | boolean | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.NOT_EQUAL, value, quote));
    return this.swapAnd();
  }

  public gt(field: string, value: string | number | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.GREATER_THAN, value, quote));
    return this.swapAnd();
  }

  public ge(field: string, value: string | number | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.GREATER_THAN_OR_EQUAL, value, quote));
    return this.swapAnd();
  }

  public lt(field: string, value: string | number | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.LESS_THAN, value, quote));
    return this.swapAnd();
  }

  public le(field: string, value: string | number | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.LESS_THAN_OR_EQUAL, value, quote));
    return this.swapAnd();
  }

  public isNull(field: string): RSQLCondition {
    this.root.addChild(this.generatorIsNullNode(field));
    return this.swapAnd();
  }

  public isNotNull(field: string): RSQLCondition {
    this.root.addChild(this.generatorIsNotNullNode(field));
    return this.swapAnd();
  }

  public like(field: string, value: string | null | undefined): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.LIKE, value));
    return this.swapAnd();
  }

  public starts(field: string, value: string | null | undefined): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.LIKE_RIGHT, value));
    return this.swapAnd();
  }

  public ends(field: string, value: string | null | undefined): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.LIKE_LEFT, value));
    return this.swapAnd();
  }

  public notLike(field: string, value: string | null | undefined): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.NOT_LIKE, value));
    return this.swapAnd();
  }

  public notStarts(field: string, value: string | null | undefined): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.NOT_LIKE_RIGHT, value));
    return this.swapAnd();
  }

  public notEnds(field: string, value: string | null | undefined): RSQLCondition {
    this.root.addChild(this.generatorSingleComparisonNode(field, RSQLOperators.NOT_LIKE_LEFT, value));
    return this.swapAnd();
  }

  public in(field: string, values: (string | number)[] | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorMultipleComparisonNode(field, RSQLOperators.IN, values, quote));
    return this.swapAnd();
  }

  public notIn(field: string, values: (string | number)[] | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorMultipleComparisonNode(field, RSQLOperators.NOT_IN, values, quote));
    return this.swapAnd();
  }

  public bit(field: string, values: (string | number)[] | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorMultipleComparisonNode(field, RSQLOperators.BIT, values, quote));
    return this.swapAnd();
  }

  public notBit(field: string, values: (string | number)[] | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorMultipleComparisonNode(field, RSQLOperators.NOT_BIT, values, quote));
    return this.swapAnd();
  }

  public has(field: string, values: (string | number)[] | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorMultipleComparisonNode(field, RSQLOperators.HAS, values, quote));
    return this.swapAnd();
  }

  public notHas(field: string, values: (string | number)[] | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorMultipleComparisonNode(field, RSQLOperators.NOT_HAS, values, quote));
    return this.swapAnd();
  }

  public hasOr(field: string, values: (string | number)[] | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorMultipleComparisonNode(field, RSQLOperators.HAS_OR, values, quote));
    return this.swapAnd();
  }

  public hasNotOr(field: string, values: (string | number)[] | null | undefined, quote?: RSQLQuote): RSQLCondition {
    this.root.addChild(this.generatorMultipleComparisonNode(field, RSQLOperators.HAS_NOT_OR, values, quote));
    return this.swapAnd();
  }

  public and(consumer: (condition: RSQLCondition) => RSQLCondition): RSQLCondition {
    const condition = consumer(
      new RSQLCondition(this.generatorNode(RSQLNodeInfo.newNodeInfo(RSQLNodeInfoType.AND)), this.counter)
    );
    this.root.addChild(condition.root);
    return this.swapAnd();
  }

  public or(consumer?: (condition: RSQLCondition) => RSQLCondition): RSQLCondition {
    const condition = new RSQLCondition(
      this.generatorNode(RSQLNodeInfo.newNodeInfo(RSQLNodeInfoType.OR)),
      this.counter
    );
    if (consumer) {
      const target = consumer(
        new RSQLCondition(this.generatorNode(RSQLNodeInfo.newNodeInfo(RSQLNodeInfoType.AND)), this.counter)
      );
      if (!target.root.children.length) {
        return this;
      }
      condition.root.addChild(this.root);
      condition.root.addChild(target.root);
      return condition.swapAnd();
    }
    condition.root.addChild(this.root);
    return condition;
  }

  private swapAnd(): RSQLCondition {
    if (this.root.value?.type === RSQLNodeInfoType.OR) {
      const conditionNode = this.generatorNode(RSQLNodeInfo.newNodeInfo(RSQLNodeInfoType.AND));
      conditionNode.addChild(this.root);
      return new RSQLCondition(conditionNode, this.counter);
    }
    return this;
  }

  public toString(): string {
    return RSQLHelper.toRSQL(this.root) || '';
  }

  private generatorNode(nodeInfo: RSQLConditionNodeInfo): TreeNode<RSQLConditionNodeInfo> {
    return new TreeNode((this.counter++).toString(), nodeInfo);
  }

  private generatorIsNullNode(field: string) {
    return this.generatorNode({
      type: RSQLNodeInfoType.COMPARISON,
      selector: field,
      operator: RSQLOperators.IS_NULL,
      args: [BooleanHelper.TRUE_STRING]
    });
  }

  private generatorIsNotNullNode(field: string) {
    return this.generatorNode({
      type: RSQLNodeInfoType.COMPARISON,
      selector: field,
      operator: RSQLOperators.IS_NOT_NULL,
      args: [BooleanHelper.TRUE_STRING]
    });
  }

  private generatorSingleComparisonNode(
    field: string,
    operator: RSQLComparisonOperator,
    value: string | number | boolean | null | undefined,
    quote?: RSQLQuote
  ): TreeNode<RSQLConditionNodeInfo> {
    if (value == null) {
      if (operator.isInvert) {
        return this.generatorIsNotNullNode(field);
      }
      return this.generatorIsNullNode(field);
    }
    return this.generatorNode({
      type: RSQLNodeInfoType.COMPARISON,
      quote,
      selector: field,
      operator,
      args: [value.toString()]
    });
  }

  private generatorMultipleComparisonNode(
    field: string,
    operator: RSQLComparisonOperator,
    values: (string | number | boolean)[] | null | undefined,
    quote?: RSQLQuote
  ): TreeNode<RSQLConditionNodeInfo> {
    if (values == null) {
      if (operator.isInvert) {
        return this.generatorIsNotNullNode(field);
      }
      return this.generatorIsNullNode(field);
    }
    return this.generatorNode({
      type: RSQLNodeInfoType.COMPARISON,
      quote,
      selector: field,
      operator,
      args: values.map((v) => v.toString())
    });
  }

  public static wrapper(root?: TreeNode<RSQLConditionNodeInfo>): RSQLCondition {
    return new RSQLCondition(root);
  }
}

console.log(RSQLCondition.wrapper().in('status', ['INSTALLED', 'UPGRADED']).toString());
