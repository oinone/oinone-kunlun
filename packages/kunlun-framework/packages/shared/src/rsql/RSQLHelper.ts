import { ExpressionNode } from '@rsql/ast';
import { parse } from '@rsql/parser';
import { ObjectUtils } from '../ObjectUtils';
import { TreeNode } from '../tree-node';
import { NodeComputer, RSQLNodeComputer } from './computer';
import { NodeConnector, RSQLNodeConnector } from './connector';
import { BaseRSQLNodeInfo, RSQLModel, RSQLNodeInfo, RSQLNodeInfoType } from './RSQLNodeInfo';
import { RSQLLogicalOperator } from './RSQLOperator';
import { ModelRSQLVisitor, NormalRSQLVisitor } from './visitor';

export class RSQLHelper {
  public static parse(model: RSQLModel, rsql: string): TreeNode<RSQLNodeInfo> | undefined {
    try {
      const node: ExpressionNode = parse(rsql);
      return ModelRSQLVisitor.visit(node, model);
    } catch (e) {
      console.error(e);
    }
  }

  public static parseSimple(rsql: string): TreeNode<RSQLNodeInfo> | undefined {
    try {
      const node: ExpressionNode = parse(rsql);
      return NormalRSQLVisitor.visit(node);
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

  public static toRSQL(root: TreeNode<RSQLNodeInfo>): string | undefined {
    const result = RSQLHelper.toTargetString(root, RSQLNodeConnector.INSTANCE);
    if (result && result[0] === '(' && result[result.length - 1] === ')') {
      return result.substring(1, result.length - 1);
    }
    return result;
  }

  public static toTargetString<T extends BaseRSQLNodeInfo>(
    node: TreeNode<T>,
    connector: NodeConnector<T>
  ): string | undefined {
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

  public static computeRSQLSimple(rsql: string, data: Record<string, unknown>): boolean {
    const node = RSQLHelper.parseSimple(rsql);
    if (!node) {
      return false;
    }
    return RSQLHelper.compute(node, data);
  }

  public static computeRSQL(model: RSQLModel, rsql: string, data: Record<string, unknown>): boolean {
    const node = RSQLHelper.parse(model, rsql);
    if (!node) {
      return false;
    }
    return RSQLHelper.compute(node, data);
  }

  public static compute(
    node: TreeNode<RSQLNodeInfo>,
    data: Record<string, unknown>,
    computer?: NodeComputer<RSQLNodeInfo, Record<string, unknown>>
  ): boolean {
    const type = node.value?.type;
    if (type == null) {
      return false;
    }
    switch (type) {
      case RSQLNodeInfoType.AND:
        for (const child of node.children) {
          const value = RSQLHelper.compute(child, data);
          if (!value) {
            return false;
          }
        }
        return true;
      case RSQLNodeInfoType.OR:
        for (const child of node.children) {
          const value = RSQLHelper.compute(child, data);
          if (value) {
            return true;
          }
        }
        return false;
      case RSQLNodeInfoType.COMPARISON:
        return (computer || RSQLNodeComputer.INSTANCE).comparisonCompute(node.value!, data);
      default:
        throw new Error(`Invalid node info type. value=${type}`);
    }
  }
}
