import { ObjectUtils } from '@oinone/kunlun-shared';
import { Declaration, Expression, getNodeType, Literal, Node, NodeType, Pattern, Statement } from '../../types';

export class NodeConverter {
  private node: Node;

  private constructor(node: Node) {
    this.node = node;
  }

  public static from(node: Node) {
    return new NodeConverter(node);
  }

  public toLiteral<T extends Literal>(type: T['type'], options: Omit<T, keyof Literal>): T {
    this.clear('literal', type);
    return this.shallowMerge(options);
  }

  public toExpression<T extends Expression>(type: T['type'], options: Omit<T, keyof Expression>): T {
    this.clear('expression', type);
    return this.shallowMerge(options);
  }

  public toStatement<T extends Statement>(type: T['type'], options: Omit<T, keyof Statement>): T {
    this.clear('statement', type);
    return this.shallowMerge(options);
  }

  public toPattern<T extends Pattern>(type: T['type'], options: Omit<T, keyof Pattern>): T {
    this.clear('pattern', type);
    return this.shallowMerge(options);
  }

  public toDeclaration<T extends Declaration>(type: T['type'], options: Omit<T, keyof Declaration>): T {
    this.clear('declaration', type);
    return this.shallowMerge(options);
  }

  public to<T extends Node>(target: T): T {
    this.clear(getNodeType(target), target.type);
    return this.shallowMerge(target);
  }

  private shallowMerge<T extends Node>(options: Omit<T, keyof T>): T {
    const { node } = this;
    ObjectUtils.shallowMerge(node, options);
    return node as T;
  }

  private clear(nodeType: NodeType, type: string) {
    const { node } = this;
    Object.keys(node).forEach((v) => {
      delete node[v];
    });
    node.type = type;
    node.__node = true;
    switch (nodeType) {
      case 'literal':
        (node as Literal).__literal = true;
        break;
      case 'expression':
        (node as Expression).__expression = true;
        break;
      case 'statement':
        (node as Statement).__statement = true;
        break;
      case 'pattern':
        (node as Pattern).__pattern = true;
        break;
      case 'declaration':
        (node as Declaration).__declare = true;
        break;
    }
  }
}
