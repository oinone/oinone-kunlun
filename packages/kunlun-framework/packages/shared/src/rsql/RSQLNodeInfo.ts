import { RSQLComparisonNode } from './node';
import { RSQLComparisonOperator } from './RSQLOperator';

export interface RSQLModel {
  model: string;
  fields: RSQLField[];

  [key: string]: unknown;
}

export interface RSQLField {
  name: string;

  /**
   * ModelFieldType
   */
  ttype?: string;

  /**
   * ModelFieldType
   */
  relatedTtype?: string;

  referencesModel?: {
    modelFields?: RSQLField[];
    [key: string]: unknown;
  };

  [key: string]: unknown;
}

export enum RSQLNodeInfoType {
  AND,
  OR,
  COMPARISON
}

export interface BaseRSQLNodeInfo {
  type: RSQLNodeInfoType;
}

export interface RSQLConditionNodeInfo extends BaseRSQLNodeInfo {
  quote?: RSQLQuote;

  selector?: string;

  operator?: RSQLComparisonOperator;

  args?: string[];
}

/**
 * RSQL 引号类型
 * <p>
 * <ul>
 *   <li>null: automatic add single quote marks when the value is not number or boolean</li>
 *   <li>true: single quote marks</li>
 *   <li>false: none quote marks</li>
 *   <li>string: any quote marks</li>
 * </ul>
 */
export type RSQLQuote = boolean | string;

export class RSQLNodeInfo implements RSQLConditionNodeInfo {
  public readonly type: RSQLNodeInfoType;

  public model?: RSQLModel;

  public field?: RSQLField;

  public quote?: RSQLQuote;

  public selector?: string;

  public operator?: RSQLComparisonOperator;

  public args?: string[];

  private constructor(
    type: RSQLNodeInfoType,
    model?: RSQLModel,
    field?: RSQLField,
    selector?: string,
    operator?: RSQLComparisonOperator,
    args?: string[]
  ) {
    this.type = type;
    this.model = model;
    this.field = field;
    this.selector = selector;
    this.operator = operator;
    this.args = args;
  }

  public static newNodeInfo(type: RSQLNodeInfoType) {
    return new RSQLNodeInfo(type);
  }

  public static newNodeInfoByComparisonNode(
    node: RSQLComparisonNode,
    model: RSQLModel | undefined,
    field: RSQLField | undefined
  ) {
    return new RSQLNodeInfo(RSQLNodeInfoType.COMPARISON, model, field, node.selector, node.operator, node.args);
  }
}
