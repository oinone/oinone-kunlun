import { Node } from '../../types';
import { Visitor, VisitorAdapter } from '../visit';
import { StringAdapterContext, StringAdapterInstance } from './adapter';

export class ToString {
  public static run(node: Node, visitor?: VisitorAdapter): string {
    const nodeVisitor = new Visitor<StringAdapterContext>({ visitor: visitor || StringAdapterInstance });
    nodeVisitor.visit(node);
    return nodeVisitor.getContext().result || '';
  }
}

export * from './adapter';
export * from './rsql-adapter';
