import { ExpressionNode, isLogicNode } from '@rsql/ast';
import { isArray } from 'lodash-es';
import { BooleanHelper } from '../../BooleanHeler';
import { TreeNode } from '../../tree-node';
import { RSQLNodeFactory } from '../node';
import { RSQLField, RSQLModel, RSQLNodeInfo, RSQLNodeInfoType } from '../RSQLNodeInfo';
import { RSQLLogicalOperators, RSQLOperators } from '../RSQLOperator';

interface NodeVisitor {
  node: ExpressionNode;
  left: boolean;
  right: boolean;
}

class AbstractRSQlVisitor {
  private counter = 0;

  protected nodeFactory: RSQLNodeFactory;

  protected constructor(nodeFactory: RSQLNodeFactory) {
    this.nodeFactory = nodeFactory;
  }

  protected generatorNode(nodeInfo: RSQLNodeInfo | undefined): TreeNode<RSQLNodeInfo> | undefined {
    if (!nodeInfo) {
      return undefined;
    }
    return new TreeNode((this.counter++).toString(), nodeInfo);
  }
}

export class NormalRSQLVisitor extends AbstractRSQlVisitor {
  protected constructor(nodeFactory: RSQLNodeFactory) {
    super(nodeFactory);
  }

  public static visit(node: ExpressionNode): TreeNode<RSQLNodeInfo> | undefined {
    const visitor = new NormalRSQLVisitor(new RSQLNodeFactory(RSQLOperators.operators()));
    return visitor.visit(node);
  }

  public visit(node: ExpressionNode) {
    let treeNode: TreeNode<RSQLNodeInfo> | undefined;
    const { type, operator } = node;
    switch (type) {
      case 'LOGIC': {
        switch (operator) {
          case ';':
          case 'and':
            treeNode = this.visitAnd(node);
            break;
          case ',':
          case 'or':
            treeNode = this.visitOr(node);
            break;
        }
        break;
      }
      case 'COMPARISON':
        treeNode = this.visitComparison(node);
        break;
    }
    return treeNode;
  }

  public visitAnd(node: ExpressionNode): TreeNode<RSQLNodeInfo> | undefined {
    const currentNode = this.generatorNode(this.generatorNodeInfo(RSQLNodeInfoType.AND));
    if (currentNode) {
      this.traversal(currentNode, node);
    }
    return currentNode;
  }

  public visitOr(node: ExpressionNode): TreeNode<RSQLNodeInfo> | undefined {
    const currentNode = this.generatorNode(this.generatorNodeInfo(RSQLNodeInfoType.OR));
    if (currentNode) {
      this.traversal(currentNode, node);
    }
    return currentNode;
  }

  public visitComparison(node: ExpressionNode): TreeNode<RSQLNodeInfo> | undefined {
    return this.generatorNode(this.generatorNodeInfo(RSQLNodeInfoType.COMPARISON, node));
  }

  private generatorNodeInfo(type: RSQLNodeInfoType, node?: ExpressionNode): RSQLNodeInfo | undefined {
    let nodeInfo: RSQLNodeInfo | undefined;
    if (node) {
      const { left: leftNode, right: rightNode } = node;
      const leftType = leftNode.type;
      const rightType = rightNode.type;
      if (leftType === 'SELECTOR' && rightType === 'VALUE') {
        const fieldName = leftNode.selector;
        let args = rightNode.value;
        if (typeof args === 'string') {
          args = [args];
        }
        const comparisonNode = this.nodeFactory.createComparisonNode(node.operator, fieldName, args);
        if (comparisonNode) {
          nodeInfo = RSQLNodeInfo.newNodeInfoByComparisonNode(comparisonNode);
        }
      }
    } else {
      nodeInfo = RSQLNodeInfo.newNodeInfo(type);
    }
    return nodeInfo;
  }

  private traversal(currentNode: TreeNode<RSQLNodeInfo>, node: ExpressionNode) {
    const { operator, left, right } = node;
    let target: NodeVisitor | undefined;
    const stack: NodeVisitor[] = [];
    if (right) {
      stack.push({ node: right as ExpressionNode, left: true, right: true });
    }
    if (left) {
      stack.push({ node: left as ExpressionNode, left: true, right: true });
    }
    target = stack.pop();
    while (target) {
      const { node: targetNode } = target;
      const { operator: targetOperator } = targetNode;
      if (isLogicNode(targetNode)) {
        const o1 = BooleanHelper.toNumber(RSQLLogicalOperators.isAnd(operator));
        const o2 = BooleanHelper.toNumber(RSQLLogicalOperators.isAnd(targetOperator));
        if (
          (o1 ^ BooleanHelper.toNumber(RSQLLogicalOperators.isOr(operator))) === 1 &&
          (o2 ^ BooleanHelper.toNumber(RSQLLogicalOperators.isOr(targetOperator))) === 1
        ) {
          if ((o1 ^ o2) === 1) {
            this.appendChild(currentNode, target);
          } else {
            const temporary = this.traversalChild(stack, target);
            if (temporary) {
              target = temporary;
              continue;
            }
          }
        } else {
          console.error('Invalid target node');
        }
      } else {
        this.appendChild(currentNode, target);
      }
      target = stack.pop();
    }
    return currentNode;
  }

  private traversalChild(stack: NodeVisitor[], target: NodeVisitor): NodeVisitor | undefined {
    const { node: targetNode, left: traversalLeft, right: traversalRight } = target;
    if (traversalLeft) {
      stack.push(target);
      target.left = false;
      return { node: targetNode.left as ExpressionNode, left: true, right: true };
    }
    if (traversalRight) {
      stack.push(target);
      target.right = false;
      return { node: targetNode.right as ExpressionNode, left: true, right: true };
    }
  }

  private appendChild(currentNode: TreeNode<RSQLNodeInfo>, target: NodeVisitor) {
    const { node: targetNode } = target;
    const { operator: targetOperator } = targetNode;
    let child: TreeNode<RSQLNodeInfo> | undefined;
    const isLogic = isLogicNode(targetNode);
    if (isLogic) {
      if (RSQLLogicalOperators.isAnd(targetOperator)) {
        child = this.visitAnd(targetNode);
      } else if (RSQLLogicalOperators.isOr(targetOperator)) {
        child = this.visitOr(targetNode);
      }
    } else {
      child = this.visitComparison(targetNode);
    }
    if (!child || (isLogic && !child.children.length)) {
      return undefined;
    }
    currentNode.addChild(child);
  }
}

export class ModelRSQLVisitor extends AbstractRSQlVisitor {
  protected constructor(nodeFactory: RSQLNodeFactory) {
    super(nodeFactory);
  }

  public static visit(node: ExpressionNode, model: RSQLModel): TreeNode<RSQLNodeInfo> | undefined {
    const visitor = new ModelRSQLVisitor(new RSQLNodeFactory(RSQLOperators.operators()));
    return visitor.visit(node, model);
  }

  public visit(node: ExpressionNode, model: RSQLModel) {
    let treeNode: TreeNode<RSQLNodeInfo> | undefined;
    const { type, operator } = node;
    switch (type) {
      case 'LOGIC': {
        switch (operator) {
          case ';':
          case 'and':
            treeNode = this.visitAnd(node, model);
            break;
          case ',':
          case 'or':
            treeNode = this.visitOr(node, model);
            break;
        }
        break;
      }
      case 'COMPARISON':
        treeNode = this.visitComparison(node, model);
        break;
    }
    return treeNode;
  }

  public visitAnd(node: ExpressionNode, model: RSQLModel): TreeNode<RSQLNodeInfo> | undefined {
    const currentNode = this.generatorNode(this.generatorNodeInfo(RSQLNodeInfoType.AND));
    if (currentNode) {
      this.traversal(currentNode, node, model);
    }
    return currentNode;
  }

  public visitOr(node: ExpressionNode, model: RSQLModel): TreeNode<RSQLNodeInfo> | undefined {
    const currentNode = this.generatorNode(this.generatorNodeInfo(RSQLNodeInfoType.OR));
    if (currentNode) {
      this.traversal(currentNode, node, model);
    }
    return currentNode;
  }

  public visitComparison(node: ExpressionNode, model: RSQLModel): TreeNode<RSQLNodeInfo> | undefined {
    return this.generatorNode(this.generatorNodeInfo(RSQLNodeInfoType.COMPARISON, model, node));
  }

  private generatorNodeInfo(
    type: RSQLNodeInfoType,
    model?: RSQLModel,
    node?: ExpressionNode
  ): RSQLNodeInfo | undefined {
    let nodeInfo: RSQLNodeInfo | undefined;
    if (node) {
      const { left: leftNode, right: rightNode } = node;
      const leftType = leftNode.type;
      const rightType = rightNode.type;
      if (leftType === 'SELECTOR' && rightType === 'VALUE') {
        const { selector } = leftNode;
        let args = rightNode.value;
        if (!isArray(args)) {
          args = [args];
        }
        const comparisonNode = this.nodeFactory.createComparisonNode(node.operator, selector, args);
        if (comparisonNode) {
          let field: RSQLField | undefined;
          if (model) {
            field = this.findRSQLField(model, selector);
          }
          nodeInfo = RSQLNodeInfo.newNodeInfoByComparisonNode(comparisonNode, model, field);
        }
      }
    } else {
      nodeInfo = RSQLNodeInfo.newNodeInfo(type);
    }
    return nodeInfo;
  }

  private findRSQLField(model: RSQLModel, selector: string): RSQLField | undefined {
    const fields = selector.split('.');
    const firstField = fields[0];
    let field = model.fields.find((v) => v.name === firstField);
    if (!field || fields.length === 1) {
      return field;
    }
    for (let i = 1; i < fields.length; i++) {
      const nextField = fields[i];
      field = field.referencesModel?.modelFields?.find((v) => v.name === nextField);
      if (!field) {
        break;
      }
    }
    return field;
  }

  private traversal(currentNode: TreeNode<RSQLNodeInfo>, node: ExpressionNode, model: RSQLModel) {
    const { operator, left, right } = node;
    let target: NodeVisitor | undefined;
    const stack: NodeVisitor[] = [];
    if (right) {
      stack.push({ node: right as ExpressionNode, left: true, right: true });
    }
    if (left) {
      stack.push({ node: left as ExpressionNode, left: true, right: true });
    }
    target = stack.pop();
    while (target) {
      const { node: targetNode } = target;
      const { operator: targetOperator } = targetNode;
      if (isLogicNode(targetNode)) {
        const o1 = BooleanHelper.toNumber(RSQLLogicalOperators.isAnd(operator));
        const o2 = BooleanHelper.toNumber(RSQLLogicalOperators.isAnd(targetOperator));
        if (
          (o1 ^ BooleanHelper.toNumber(RSQLLogicalOperators.isOr(operator))) === 1 &&
          (o2 ^ BooleanHelper.toNumber(RSQLLogicalOperators.isOr(targetOperator))) === 1
        ) {
          if ((o1 ^ o2) === 1) {
            this.appendChild(currentNode, target, model);
          } else {
            const temporary = this.traversalChild(stack, target);
            if (temporary) {
              target = temporary;
              continue;
            }
          }
        } else {
          console.error('Invalid target node');
        }
      } else {
        this.appendChild(currentNode, target, model);
      }
      target = stack.pop();
    }
    return currentNode;
  }

  private traversalChild(stack: NodeVisitor[], target: NodeVisitor): NodeVisitor | undefined {
    const { node: targetNode, left: traversalLeft, right: traversalRight } = target;
    if (traversalLeft) {
      stack.push(target);
      target.left = false;
      return { node: targetNode.left as ExpressionNode, left: true, right: true };
    }
    if (traversalRight) {
      stack.push(target);
      target.right = false;
      return { node: targetNode.right as ExpressionNode, left: true, right: true };
    }
  }

  private appendChild(currentNode: TreeNode<RSQLNodeInfo>, target: NodeVisitor, model: RSQLModel) {
    const { node: targetNode } = target;
    const { operator: targetOperator } = targetNode;
    let child: TreeNode<RSQLNodeInfo> | undefined;
    const isLogic = isLogicNode(targetNode);
    if (isLogic) {
      if (RSQLLogicalOperators.isAnd(targetOperator)) {
        child = this.visitAnd(targetNode, model);
      } else if (RSQLLogicalOperators.isOr(targetOperator)) {
        child = this.visitOr(targetNode, model);
      }
    } else {
      child = this.visitComparison(targetNode, model);
    }
    if (!child || (isLogic && !child.children.length)) {
      return undefined;
    }
    currentNode.addChild(child);
  }
}

/**
 * @deprecated please using ModelRSQLVisitor
 */
export class DefaultRSQLVisitor extends ModelRSQLVisitor {
  public constructor(nodeFactory: RSQLNodeFactory) {
    super(nodeFactory);
  }
}

const RELATION_FIELD_TTYPES = ['O2O', 'O2M', 'M2O', 'M2M'];

function getRealTtype(field: RSQLField) {
  let finalTtype = field.ttype;
  if (field.ttype === 'RELATED') {
    finalTtype = field.relatedTtype;
  }
  return finalTtype as string;
}

function isRelationField(field: RSQLField) {
  return RELATION_FIELD_TTYPES.includes(getRealTtype(field));
}
