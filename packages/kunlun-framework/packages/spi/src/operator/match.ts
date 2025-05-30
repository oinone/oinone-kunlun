import { InternalMatchKey } from '../typing/match-key';
import { isMultiValueNode, MultiValueNode, NodeType, SingleValueNode } from '../typing/node';
import { isMatchAnyValue, isMatchArrayValue, MatchValues } from '../typing/options';

/**
 * [是否匹配, 匹配数量]
 * - 匹配数量: 全等匹配时为1，包含匹配时为相应的匹配数量
 */
type MatchResult = [boolean, number];

const DEFAULT_SUCCESS_MATCH_RESULT: MatchResult = [true, 1];

const ERROR_MATCH_RESULT: MatchResult = [false, -1];

/**
 * 是否为匹配节点
 * @param node 节点
 * @param matchKey 匹配键
 * @param value 匹配值
 * @return [是否匹配, 匹配数量]
 */
export function isMatch<V>(node: NodeType<V>, matchKey: InternalMatchKey, value: MatchValues): MatchResult {
  if (node.matchKey.key !== matchKey.key) {
    return ERROR_MATCH_RESULT;
  }
  if (isMatchAnyValue(value)) {
    return DEFAULT_SUCCESS_MATCH_RESULT;
  }
  if (isMultiValueNode(node)) {
    return multiValueNodeMatch(node, value);
  }
  return singleValueNodeMatch(node, value);
}

/**
 * <h3>单值节点匹配</h3>
 * <p>匹配规则:</p>
 * - 当可选项值为单值时，进行全等匹配
 * - 当可选项值为多值时，进行包含匹配；当匹配值为boolean时，不匹配；
 * @param node 节点
 * @param value 可选项值
 */
function singleValueNodeMatch<V>(node: SingleValueNode<V>, value: MatchValues): MatchResult {
  const { matchValue } = node;
  if (isMatchArrayValue(value)) {
    if (typeof matchValue === 'boolean') {
      return ERROR_MATCH_RESULT;
    }
    if (value.includes(matchValue)) {
      return DEFAULT_SUCCESS_MATCH_RESULT;
    }
  } else if (value === matchValue) {
    return DEFAULT_SUCCESS_MATCH_RESULT;
  }
  return ERROR_MATCH_RESULT;
}

/**
 * <h>多值节点匹配</h>
 * <p>匹配规则:</p>
 * - 当可选项值为单值时，进行包含匹配
 * - 当可选项为多值时，进行数组匹配，权重为当前节点键值权重乘以匹配数量
 *
 * @param node 节点
 * @param value 可选项值
 */
function multiValueNodeMatch<V>(node: MultiValueNode<V>, value: MatchValues): MatchResult {
  const { matchValues } = node;
  if (isMatchArrayValue(value)) {
    let matchCount = 0;
    for (let i = 0; i < matchValues.length; i++) {
      const matchValue = matchValues[i];
      if (value.includes(matchValue)) {
        matchCount += 1;
      }
    }
    if (!matchCount) {
      return ERROR_MATCH_RESULT;
    }
    return [true, matchCount];
  }
  if (typeof value === 'boolean') {
    return ERROR_MATCH_RESULT;
  }
  if (matchValues.includes(value)) {
    return DEFAULT_SUCCESS_MATCH_RESULT;
  }
  return ERROR_MATCH_RESULT;
}
