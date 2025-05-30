import { RawValue } from './interface';
import { StrControl } from './str-control';

interface ConditionConfig {
  quote: string;
}

interface LogicalOperator {
  AND: string;
  OR: string;
}

interface ComparisonOperator {
  COL_EQUAL: string;
  COL_NOT_EQUAL: string;
  EQUAL: string;
  NOT_EQUAL: string;
  GREATER_THAN: string;
  GREATER_THAN_OR_EQUAL: string;
  LESS_THAN: string;
  LESS_THAN_OR_EQUAL: string;
  IN: string;
  NOT_IN: string;

  LIKE: string;
  STARTS: string;
  ENDS: string;
  NOT_LIKE: string;
  NOT_STARTS: string;
  NOT_ENDS: string;

  IS_NULL: string;
  NOT_NULL: string;

  // Binary Enumeration
  BIT: string;
  NOT_BIT: string;
  HAS: string;
  HAS_NOT: string;
  HAS_OR: string;
  HAS_NOT_OR: string;

  /**
   * @deprecated please using BIT
   */
  BIT_EQUAL: string;
  /**
   * @deprecated please using NOT_BIT
   */
  BIT_NOT_EQUAL: string;
  /**
   * @deprecated please using HAS
   */
  BIT_CONTAIN: string;
  /**
   * @deprecated please using HAS_NOT
   */
  BIT_NOT_CONTAIN: string;
  /**
   * @deprecated
   */
  CONTAIN: string;
  /**
   * @deprecated
   */
  NOT_CONTAIN: string;
}

// Condition 中的 null 需要保留为字符串
type ConditionType = RawValue | string | number | boolean | null;

enum DefaultLogicalOperator {
  AND = 'and',
  OR = 'or'
}

enum DefaultComparisonOperator {
  EQUAL = '==',
  NOT_EQUAL = '!=',
  GREATER_THAN = '=gt=',
  GREATER_THAN_OR_EQUAL = '=ge=',
  LESS_THAN = '=lt=',
  LESS_THAN_OR_EQUAL = '=le=',
  IN = '=in=',
  NOT_IN = '=out=',

  COL_EQUAL = '=cole=',
  COL_NOT_EQUAL = '=colnot=',
  LIKE = '=like=',
  STARTS = '=starts=',
  ENDS = '=ends=',
  NOT_LIKE = '=notlike=',
  NOT_STARTS = '=notstarts=',
  NOT_ENDS = '=notends=',

  IS_NULL = '=isnull=true',
  NOT_NULL = '=notnull=true',

  // Binary Enumeration
  BIT = '=bit',
  NOT_BIT = '=notbit=',
  HAS = '=has=',
  HAS_NOT = '=hasnt=',
  HAS_OR = '=hasor=',
  HAS_NOT_OR = '=hasntor=',

  /**
   * @deprecated using BIT
   */
  BIT_EQUAL = '=bit=',
  /**
   * @deprecated using NOT_BIT
   */
  BIT_NOT_EQUAL = '=notbit=',
  /**
   * @deprecated using HAS
   */
  BIT_CONTAIN = '=has=',
  /**
   * @deprecated using HAS_NOT
   */
  BIT_NOT_CONTAIN = '=hasnt=',
  /**
   * @deprecated
   */
  CONTAIN = '=contain=',
  /**
   * @deprecated
   */
  NOT_CONTAIN = '=notcontain='
}

// enum ComparisonOperator {
//   EQUAL = '=',
//   NOT_EQUAL = '!=',
//   GREATER_THAN = '>',
//   GREATER_THAN_OR_EQUAL = '>=',
//   LESS_THAN = '<',
//   LESS_THAN_OR_EQUAL = '<=',
//   IN = ' IN ',
//   NOT_IN = ' NOT IN ',

//   LIKE = ' LIKE ',
//   NOT_LIKE = ' NOT LIKE ',

//   IS_NULL = ' IS NULL ',
//   NOT_NULL = ' IS NOT NULL ',
// }

export class Condition extends StrControl {
  private comparisonOps: ComparisonOperator = DefaultComparisonOperator;

  private logicalOps: LogicalOperator = DefaultLogicalOperator;

  private conditionBodyData: Record<string, unknown> = {};

  public constructor(key: string, private config: ConditionConfig = { quote: "'" }) {
    super();
    this.append(key);
  }

  public setConditionBodyData(data: Record<string, unknown>) {
    this.conditionBodyData = data;
  }

  public getConditionBodyData() {
    return this.conditionBodyData;
  }

  // TODO: Condition 合法校验
  public toString(): string {
    return super.toString();
  }

  // operates
  public and(condition: Condition) {
    return this.prepend('(')
      .append(')')
      .append(' ')
      .append(this.logicalOps.AND)
      .append(' ')
      .append('(')
      .append(condition.toString())
      .append(')');
  }

  public or(condition: Condition) {
    return this.prepend('(')
      .append(')')
      .append(' ')
      .append(this.logicalOps.OR)
      .append(' ')
      .append('(')
      .append(condition.toString())
      .append(')');
  }

  public like(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.LIKE).append(this.preprocessCondition(condition, isPreprocess));
  }

  public bitEqual(condition: ConditionType) {
    return this.append(this.comparisonOps.BIT_EQUAL).append(this.preprocessCondition(condition, false));
  }

  public bitNotEqual(condition: ConditionType) {
    return this.append(this.comparisonOps.BIT_NOT_EQUAL).append(this.preprocessCondition(condition, false));
  }

  /**
   * @deprecated please using has
   */
  public bitContain(args: string | string[]) {
    return this.has(args);
  }

  public has(args: string | string[]) {
    const condition = this.preprocessStrArgs(args);
    return this.append(this.comparisonOps.HAS).append('(').append(condition).append(')');
  }

  /**
   * @deprecated please using hasNot
   */
  public bitNotContain(args: string | string[]) {
    return this.hasNot(args);
  }

  public hasNot(args: string | string[]) {
    return this.append(this.comparisonOps.HAS_NOT).append('(').append(this.preprocessStrArgs(args)).append(')');
  }

  public hasOr(args: string | string[]) {
    return this.append(this.comparisonOps.HAS_OR).append('(').append(this.preprocessStrArgs(args)).append(')');
  }

  public hasNotOr(args: string | string[]) {
    return this.append(this.comparisonOps.HAS_NOT_OR).append('(').append(this.preprocessStrArgs(args)).append(')');
  }

  public contain(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.CONTAIN).append(this.preprocessCondition(condition, isPreprocess));
  }

  public notContain(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.NOT_CONTAIN).append(this.preprocessCondition(condition, isPreprocess));
  }

  public starts(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.STARTS).append(this.preprocessCondition(condition, isPreprocess));
  }

  public ends(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.ENDS).append(this.preprocessCondition(condition, isPreprocess));
  }

  public isNull() {
    return this.append(this.comparisonOps.IS_NULL);
  }

  public equal(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.EQUAL).append(this.preprocessCondition(condition, isPreprocess));
  }

  public colEqual(condition: ConditionType) {
    return this.append(this.comparisonOps.COL_EQUAL).append(this.preprocessCondition(condition, false));
  }

  public greaterThan(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.GREATER_THAN).append(this.preprocessCondition(condition, isPreprocess));
  }

  public greaterThanOrEuqalTo(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.GREATER_THAN_OR_EQUAL).append(
      this.preprocessCondition(condition, isPreprocess)
    );
  }

  public lessThan(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.LESS_THAN).append(this.preprocessCondition(condition, isPreprocess));
  }

  public lessThanOrEqualTo(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.LESS_THAN_OR_EQUAL).append(this.preprocessCondition(condition, isPreprocess));
  }

  public notLike(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.NOT_LIKE).append(this.preprocessCondition(condition, isPreprocess));
  }

  public notStarts(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.NOT_STARTS).append(this.preprocessCondition(condition, isPreprocess));
  }

  public notEnds(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.NOT_ENDS).append(this.preprocessCondition(condition, isPreprocess));
  }

  public notNull() {
    return this.append(this.comparisonOps.NOT_NULL);
  }

  public notEqual(condition: ConditionType, isPreprocess = true) {
    return this.append(this.comparisonOps.NOT_EQUAL).append(this.preprocessCondition(condition, isPreprocess));
  }

  public colNotEqual(condition: ConditionType) {
    return this.append(this.comparisonOps.COL_NOT_EQUAL).append(this.preprocessCondition(condition, false));
  }

  public in(args: string | string[]) {
    const condition = this.preprocessStrArgs(args);
    return this.append(this.comparisonOps.IN).append('(').append(condition).append(')');
  }

  public notIn(args: string | string[]) {
    const condition = this.preprocessStrArgs(args);
    return this.append(this.comparisonOps.NOT_IN).append('(').append(condition).append(')');
  }

  private preprocessStrArgs(args: string | string[], separator = ','): string {
    return Array.isArray(args) ? args.join(separator) : args;
  }

  // 字符串是否用引号包裹
  private preprocessCondition(condition: ConditionType, isPreprocess = true): string {
    if (typeof condition === 'string' && isPreprocess) {
      const { quote } = this.config;
      return `${quote}${condition}${quote}`;
    }
    if (condition instanceof RawValue) {
      return condition.value;
    }
    return `${condition}`;
  }
}

const isCondition = (v: unknown): v is Condition => v instanceof Condition;

export { DefaultLogicalOperator, DefaultComparisonOperator, ConditionConfig, RawValue, isCondition, ConditionType };
