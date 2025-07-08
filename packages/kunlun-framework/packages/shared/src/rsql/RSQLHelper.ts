import { ExpressionNode } from '@rsql/ast';
import { parse } from '@rsql/parser';
import { ObjectUtils } from '../ObjectUtils';
import { TreeNode } from '../tree-node';
import { NodeComputer, RSQLNodeComputer } from './computer';
import { NodeConnector, RSQLNodeConnector } from './connector';
import { BaseRSQLNodeInfo, RSQLModel, RSQLNodeInfo, RSQLNodeInfoType } from './RSQLNodeInfo';
import { RSQLLogicalOperator } from './RSQLOperator';
import { ModelRSQLVisitor, NormalRSQLVisitor } from './visitor';

/**
 * RSQL帮助类
 */
export class RSQLHelper {
  /**
   * @deprecated please using parseRSQL
   */
  public static parse(model: RSQLModel, rsql: string): TreeNode<RSQLNodeInfo> | undefined {
    try {
      const node: ExpressionNode = parse(rsql);
      return ModelRSQLVisitor.visit(node, model);
    } catch (e) {
      console.error('Invalid rsql expression.', rsql, e);
    }
  }

  /**
   * RSQL 解析
   * @param rsql RSQL 表达式
   * @param model RSQL 解析模型
   */
  public static parseRSQL(rsql: string, model?: RSQLModel): TreeNode<RSQLNodeInfo> | undefined {
    try {
      const node: ExpressionNode = parse(rsql);
      if (model) {
        return ModelRSQLVisitor.visit(node, model);
      }
      return NormalRSQLVisitor.visit(node);
    } catch (e) {
      console.error('Invalid rsql expression.', rsql, e);
    }
  }

  /**
   * 使用 AND 连接多个 RSQL 并跳过空值和自动去重
   * @param rsqls 多个 RSQL 表达式
   */
  public static concatByAnd(...rsqls: (string | null | undefined)[]): string | undefined {
    return RSQLHelper.concat(RSQLNodeInfoType.AND, rsqls);
  }

  /**
   * 使用 OR 连接多个 RSQL 并跳过空值和自动去重
   * @param rsqls 多个 RSQL 表达式
   */
  public static concatByOr(...rsqls: (string | null | undefined)[]): string | undefined {
    return RSQLHelper.concat(RSQLNodeInfoType.OR, rsqls);
  }

  private static concat(type: RSQLNodeInfoType, rsqls: (string | null | undefined)[]): string | undefined {
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

  /**
   * 将 RSQL 结构化数据转换为 RSQL 表达式字符串
   * @param node RSQL 结构化数据
   */
  public static toRSQL(node: TreeNode<RSQLNodeInfo>): string | undefined {
    const result = RSQLHelper.toTargetString(node, RSQLNodeConnector.INSTANCE);
    if (result && result[0] === '(' && result[result.length - 1] === ')') {
      return result.substring(1, result.length - 1);
    }
    return result;
  }

  /**
   * 将 RSQL 结构化数据转换为目标字符串
   * @param node RSQL 结构化数据
   * @param connector 连接器
   */
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

  /**
   * 计算 RSQL 表达式
   * @param rsql RSQL 表达式
   * @param data 参数对象
   * @param model RSQL 解析模型
   */
  public static computeRSQL(rsql: string, data: Record<string, unknown>, model?: RSQLModel): boolean {
    const node = RSQLHelper.parseRSQL(rsql, model);
    if (!node) {
      return false;
    }
    return RSQLHelper.compute(node, data);
  }

  /**
   * 计算 RSQL 表达式
   * @param node RSQL 结构化数据
   * @param data 参数对象
   * @param computer RSQL 计算器
   */
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
          const value = RSQLHelper.compute(child, data, computer);
          if (!value) {
            return false;
          }
        }
        return true;
      case RSQLNodeInfoType.OR:
        for (const child of node.children) {
          const value = RSQLHelper.compute(child, data, computer);
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
