import { JObject } from '../../ObjectUtils';
import { RSQLComparisonOperator, RSQLLogicalOperator } from '../RSQLOperator';

export interface RSQLNode<R = unknown, C = unknown> {
  accept(visitor: RSQLVisitor<R, C>, context?: C): R;

  toString(): string;

  equals(o: unknown): boolean;
}

export abstract class RSQLAbstractNode<R = unknown, C = unknown> extends JObject implements RSQLNode<R, C> {
  public abstract accept(visitor: RSQLVisitor<R, C>, context?: C): R;

  public equals(o: unknown): boolean {
    if (this === o) {
      return true;
    }
    if (!(o instanceof RSQLAbstractNode)) {
      return false;
    }
    return this.hashCode === o.hashCode;
  }
}

export abstract class RSQLLogicalNode<R = unknown, C = unknown>
  extends RSQLAbstractNode<R, C>
  implements RSQLNode<R, C>
{
  private readonly _operator: RSQLLogicalOperator;

  private readonly _children: RSQLNode[];

  protected constructor(operator: RSQLLogicalOperator, children: RSQLNode[]) {
    super();
    this._operator = operator;
    this._children = [...children];
  }

  public get operator(): RSQLLogicalOperator {
    return this._operator;
  }

  public get children(): RSQLNode[] {
    return [...this._children];
  }

  public abstract withChildren(nodes: RSQLNode[]): RSQLLogicalNode;

  public toString(): string {
    return `(${this._children.join(this._operator.toString())})`;
  }

  public equals(o: unknown): boolean {
    if (this === o) {
      return true;
    }
    if (!(o instanceof RSQLLogicalNode)) {
      return false;
    }
    if (this._operator !== o._operator) {
      return false;
    }
    const c1 = this._children;
    const c2 = o._children;
    const { length } = c1;
    if (length !== c2.length) {
      return false;
    }
    for (let i = 0; i < length; i++) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (!n1.equals(n2)) {
        return false;
      }
    }
    return true;
  }
}

export class RSQLAndNode<R = unknown, C = unknown> extends RSQLLogicalNode<R, C> {
  public constructor(children: RSQLNode[]) {
    super(RSQLLogicalOperator.AND, children);
  }

  public withChildren(nodes: RSQLNode[]): RSQLAndNode {
    return new RSQLAndNode(nodes);
  }

  public accept(visitor: RSQLVisitor<R, C>, context?: C): R {
    return visitor.visitAnd(this, context);
  }
}

export class RSQLOrNode<R = unknown, C = unknown> extends RSQLLogicalNode<R, C> {
  public constructor(children: RSQLNode[]) {
    super(RSQLLogicalOperator.OR, children);
  }

  public accept(visitor: RSQLVisitor<R, C>, context?: C): R {
    return visitor.visitOr(this, context);
  }

  public withChildren(nodes: RSQLNode[]): RSQLOrNode {
    return new RSQLOrNode(nodes);
  }
}

export class RSQLComparisonNode<R = unknown, C = unknown> extends RSQLAbstractNode<R, C> {
  private readonly _operator: RSQLComparisonOperator;

  private readonly _selector: string;

  private readonly _args: string[];

  constructor(operator: RSQLComparisonOperator, selector: string, args: string[]) {
    super();
    this._operator = operator;
    this._selector = selector;
    this._args = [...args];
  }

  public get operator() {
    return this._operator;
  }

  public get selector() {
    return this._selector;
  }

  public get args() {
    return [...this._args];
  }

  public accept(visitor: RSQLVisitor<R, C>, context?: C): R {
    return visitor.visitComparison(this, context);
  }

  public withOperator(newOperator: RSQLComparisonOperator) {
    return new RSQLComparisonNode(newOperator, this._selector, this._args);
  }

  public withArgs(newArgs: string[]) {
    return new RSQLComparisonNode(this._operator, this._selector, newArgs);
  }

  public equals(o: unknown): boolean {
    if (this === o) {
      return true;
    }
    if (!(o instanceof RSQLComparisonNode)) {
      return false;
    }
    if (!this._operator.equals(o._operator)) {
      return false;
    }
    if (this._selector !== o._selector) {
      return false;
    }
    const a1 = this._args;
    const a2 = o._args;
    const { length } = a1;
    if (length !== a2.length) {
      return false;
    }
    for (let i = 0; i < length; i++) {
      const v1 = a1[i];
      const v2 = a2[i];
      if (v1 !== v2) {
        return false;
      }
    }
    return true;
  }
}

export interface RSQLVisitor<R, C> {
  visitAnd(node: RSQLAndNode, context?: C): R;

  visitOr(node: RSQLOrNode, context?: C): R;

  visitComparison(node: RSQLComparisonNode, context?: C): R;
}
