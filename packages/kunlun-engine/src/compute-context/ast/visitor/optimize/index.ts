import { Node } from '../../types';
import { Visitor, VisitorAdapter } from '../visit';
import { OptimizeAdapter } from './adapter';

export class Optimize {
  public static run(node: Node, visitor?: VisitorAdapter): void {
    Visitor.run(node, visitor || new OptimizeAdapter());
  }
}

export * from './adapter';
export * from './convert';
