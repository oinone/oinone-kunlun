import { ExpressionNode, isLogicNode } from '@rsql/ast';
import { parse } from '@rsql/parser';
import { BooleanHelper } from '../BooleanHeler';
import { ObjectUtils } from '../ObjectUtils';
import { TreeNode } from '../tree-node';
import { NodeConnector, RSQLNodeConnector } from './connector/NodeConnector';
import { RSQLNodeFactory } from './node';
import { RSQLField, RSQLModel, RSQLNodeInfo, RSQLNodeInfoType } from './RSQLNodeInfo';
import { RSQLLogicalOperator, RSQLLogicalOperators, RSQLOperators } from './RSQLOperator';

const RELATION_FIELD_TTYPES = ['O2O', 'O2M', 'M2O', 'M2M'];
const RELATED_TTYPE = 'RELATED';

function isRelatedField(field: RSQLField) {
  return field.ttype === RELATED_TTYPE;
}

function getRealTtype(field: RSQLField) {
  let finalTtype = field.ttype;
  if (isRelatedField(field)) {
    finalTtype = field.relatedTtype;
  }
  return finalTtype as string;
}

function isRelationField(field: RSQLField) {
  return RELATION_FIELD_TTYPES.includes(getRealTtype(field));
}

interface NodeVisitor {
  node: ExpressionNode;
  left: boolean;
  right: boolean;
}

export class DefaultRSQLVisitor {
  private counter = 0;

  private nodeFactory: RSQLNodeFactory;

  private constructor(nodeFactory: RSQLNodeFactory) {
    this.nodeFactory = nodeFactory;
  }

  public static visit(node: ExpressionNode, model: RSQLModel): TreeNode<RSQLNodeInfo> | undefined {
    const visitor = new DefaultRSQLVisitor(new RSQLNodeFactory(RSQLOperators.operators()));
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
        const fieldName = leftNode.selector;
        let args = rightNode.value;
        // fieldName可能是  xxx.zzz
        const [name] = fieldName.split('.');

        const modelField = model?.fields.find((field) => {
          const rst = field.name === name;

          if (rst) {
            return rst;
          }

          if (isRelationField(field) && field.referencesModel) {
            return field.referencesModel.modelFields?.find((v) => v.name === name);
          }

          return false;
        });

        if (typeof args === 'string') {
          args = [args];
        }
        const comparisonNode = this.nodeFactory.createComparisonNode(node.operator, fieldName, args);
        if (comparisonNode) {
          nodeInfo = RSQLNodeInfo.newNodeInfoByComparisonNode(comparisonNode, model, modelField);
        }
      }
    } else {
      nodeInfo = RSQLNodeInfo.newNodeInfo(type) as RSQLNodeInfo;
    }
    return nodeInfo;
  }

  private generatorNode(nodeInfo: RSQLNodeInfo | undefined): TreeNode<RSQLNodeInfo> | undefined {
    if (!nodeInfo) {
      return undefined;
    }
    return new TreeNode((this.counter++).toString(), nodeInfo);
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

export class RSQLHelper {
  public static parse(model: RSQLModel, rsql: string): TreeNode<RSQLNodeInfo> | undefined {
    try {
      const node: ExpressionNode = parse(rsql);
      return DefaultRSQLVisitor.visit(node, model);
    } catch (e) {
      console.error(e);
    }
  }

  public static concatByAnd(...rsqls: (string | undefined)[]): string | undefined {
    return RSQLHelper.concat(RSQLNodeInfoType.AND, rsqls);
  }

  public static concatByOr(...rsqls: (string | undefined)[]): string | undefined {
    return RSQLHelper.concat(RSQLNodeInfoType.OR, rsqls);
  }

  private static concat(type: RSQLNodeInfoType, rsqls: (string | undefined)[]): string | undefined {
    let hasRsql = false;
    let finalRsql = '';
    const repeatSet = new Set<string>();
    for (const rsql of rsqls) {
      if (rsql && !ObjectUtils.isRepeat(repeatSet, rsql)) {
        hasRsql = true;
        if (finalRsql) {
          switch (type) {
            case RSQLNodeInfoType.AND:
              finalRsql = `(${finalRsql}) and (${rsql})`;
              break;
            case RSQLNodeInfoType.OR:
              finalRsql = `(${finalRsql}) or (${rsql})`;
              break;
          }
        } else {
          finalRsql = rsql;
        }
      }
    }
    if (hasRsql) {
      return finalRsql;
    }
    return undefined;
  }

  public static toRSQL(root: TreeNode<RSQLNodeInfo>) {
    const result = RSQLHelper.toTargetString(root, RSQLNodeConnector.INSTANCE);
    if (result && result[0] === '(' && result[result.length - 1] === ')') {
      return result.substring(1, result.length - 1);
    }
    return result;
  }

  public static toTargetString(node: TreeNode<RSQLNodeInfo>, connector: NodeConnector): string | undefined {
    const type = node.value?.type;
    if (type == null) {
      return '';
    }
    switch (type) {
      case RSQLNodeInfoType.AND:
      case RSQLNodeInfoType.OR: {
        const values: string[] = [];
        for (const child of node.children) {
          const value = RSQLHelper.toTargetString(child, connector);
          if (value == null) {
            continue;
          }
          values.push(value);
        }
        let logicType = RSQLLogicalOperator.AND;
        if (type === RSQLNodeInfoType.OR) {
          logicType = RSQLLogicalOperator.OR;
        }
        return connector.logicConnector(logicType, values);
      }
      case RSQLNodeInfoType.COMPARISON: {
        const { value } = node;
        if (value == null) {
          return undefined;
        }
        return connector.comparisonConnector(value);
      }
      default:
        throw new Error(`Invalid node info type. value=${type}`);
    }
  }
}
