import { TokenPropertiesManager } from '../../manager';
import {
  AnyExpression,
  BooleanLiteral,
  getLiteralValue,
  Identifier,
  isIdentifier,
  isMemberExpression,
  Literal,
  MemberExpression,
  Node,
  NullLiteral,
  NumberLiteral,
  StringLiteral,
  UndefinedLiteral,
  VisitContext
} from '../../types';
import { ToString } from '../to-string';
import { AdapterContext } from '../visit';
import { NodeConverter } from './convert';

export interface BaseOptimizeAdapterOptions {
  tokenProperties?: string[];
}

export abstract class AbstractOptimizeAdapter<C extends AdapterContext = AdapterContext> {
  protected tokenProperties: string[];

  protected constructor(options?: BaseOptimizeAdapterOptions) {
    this.tokenProperties = options?.tokenProperties || TokenPropertiesManager.get();
  }

  protected visitAnyExpression(ctx: VisitContext<C>, node: AnyExpression) {
    let identifier: Identifier | undefined;
    if (isIdentifier(node)) {
      identifier = node;
    } else if (isMemberExpression(node)) {
      identifier = this.findIdentifierByMemberExpression(node);
    }
    if (identifier) {
      const { value } = identifier;
      if (this.tokenProperties.length && !this.tokenProperties.includes(value)) {
        this.toLiteralByValue(node, ToString.run(node));
      }
    }
  }

  protected findIdentifierByMemberExpression(node: MemberExpression): Identifier | undefined {
    const { object } = node;
    if (isIdentifier(object)) {
      return object;
    }
    if (isMemberExpression(object)) {
      return this.findIdentifierByMemberExpression(object);
    }
    return undefined;
  }

  protected toLiteralByValue(node: Node, value: unknown): Literal | undefined {
    if (value === undefined) {
      return NodeConverter.from(node).toLiteral<UndefinedLiteral>('UndefinedLiteral', {});
    }
    if (value === null) {
      return NodeConverter.from(node).toLiteral<NullLiteral>('NullLiteral', {});
    }
    const type = typeof value;
    switch (type) {
      case 'boolean':
        return NodeConverter.from(node).toLiteral<BooleanLiteral>('BooleanLiteral', { value: value as boolean });
      case 'number':
      case 'bigint':
        return NodeConverter.from(node).toLiteral<NumberLiteral>('NumberLiteral', { value: value as number });
      case 'string':
        return NodeConverter.from(node).toLiteral<StringLiteral>('StringLiteral', { value: value as string });
    }
  }

  protected toNode<T extends Node>(origin: Node, target: T): T {
    return NodeConverter.from(origin).to(target);
  }

  protected getLiteralValue(node: Literal): { valid: boolean; value?: unknown } {
    const res = getLiteralValue(node);
    if (res?.isStatic) {
      return { valid: true, value: res.value };
    }
    return { valid: false };
  }
}
