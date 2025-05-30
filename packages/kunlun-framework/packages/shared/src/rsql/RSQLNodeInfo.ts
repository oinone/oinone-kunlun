import { RSQLComparisonNode } from './node';
import { RSQLComparisonOperator } from './RSQLOperator';

export interface RSQLModel {
  model: string;
  fields: RSQLField[];

  [key: string]: unknown;
}

export interface RSQLField {
  name: string;

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

export class RSQLNodeInfo {
  public readonly type: RSQLNodeInfoType;

  public model?: RSQLModel;

  public field?: RSQLField;

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
