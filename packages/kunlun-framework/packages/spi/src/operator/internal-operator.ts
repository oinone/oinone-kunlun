import { debugConsole } from '@kunlun/shared';
import { InternalMatchKey, MatchKeys } from '../typing/match-key';
import { isMultiValueNode, MatchNode, MultiValueNode, NodeType, SingleValueNode } from '../typing/node';
import { isMatchAnyValue, isMatchArrayValue, MatchValues, Options } from '../typing/options';
import { isMatch } from './match';

/**
 * [匹配键, 可选项值, 当前索引]
 */
type MatchResult = [InternalMatchKey, MatchValues, number];

interface MatchContext {
  fromIndex: number;
  currentWeight: number;
}

type CompareResult = 0 | 1 | -1;

/**
 * 节点权重 > 层级 > 加权值 > 匹配数量 > 序列
 * @param a 匹配节点a
 * @param b 匹配节点b
 */
function compareFn(a: MatchNode<unknown>, b: MatchNode<unknown>): CompareResult {
  let compare = compareNumberFn(a.weight, b.weight);
  if (compare !== 0) {
    return compare;
  }
  const an = a.node;
  const bn = b.node;
  compare = compareNumberFn(an.level, bn.level);
  if (compare !== 0) {
    return compare;
  }
  compare = compareNumberFn(an.matchKey.weighting, bn.matchKey.weighting);
  if (compare !== 0) {
    return compare;
  }
  compare = compareNumberFn(a.matchCount, b.matchCount);
  if (compare !== 0) {
    return compare;
  }
  compare = compareNumberFn(an.priority, bn.priority);
  if (compare !== 0) {
    return compare;
  }
  return compareNumberFn(an.index, bn.index);
}

function compareNumberFn(a: number | undefined, b: number | undefined): CompareResult {
  if (a === b) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }
  if (a < b) {
    return 1;
  }
  return -1;
}

function buildMatchNodeOptions(node: NodeType<any>) {
  const options = {};
  _buildMatchNodeOptions(options, node);
  return options;
}
function _buildMatchNodeOptions(options: Record<string, any>, node: NodeType<any> | undefined) {
  if (!node) {
    return;
  }
  options[node.matchKey.key] = (node as SingleValueNode<any>).matchValue || (node as MultiValueNode<any>).matchValues?.join(',');
  _buildMatchNodeOptions(options, node.parent)
}

export class InternalOperator<V> {
  private readonly matchKeys: InternalMatchKey[];

  private readonly keyLength: number;

  private counter = 0;

  private readonly roots: NodeType<V>[] = [];

  private defaultValue: V | undefined;

  public constructor(matchKeys: MatchKeys) {
    this.matchKeys = matchKeys.map((matchKey, index) => {
      if (typeof matchKey === 'string') {
        return {
          key: verifyKey(matchKey),
          weight: 1,
          weighting: index + 1
        };
      }
      return {
        key: verifyKey(matchKey.key),
        weight: verifyWeight(matchKey.weight),
        weighting: index + 1
      };
    });
    this.keyLength = matchKeys.length;
  }

  public get(options: Options): V | undefined {
    const matchNode = this.findMatchNode(this.roots, options);
    let res: V | undefined;
    let matchedOptions = {};
    if (matchNode) {
      res = matchNode.node.value;
      debugConsole.run(() => {
        matchedOptions = buildMatchNodeOptions(matchNode.node);
      });
    }
    if (!res && this.defaultValue != null) {
      res = this.defaultValue;
    }
    debugConsole.run(() => {
      const debugKeys = Object.keys(options).filter((a) => a !== 'priority');
      console.table({ '匹配入参': options, '匹配结果': matchedOptions }, debugKeys);
    });
    return res;
  }

  public getAll(options: Options): V[] {
    const results: V[] = [];
    const matchNodes = this.findMatchNodes(this.roots, options)?.sort(compareFn);
    if (matchNodes) {
      for (const matchNode of matchNodes) {
        const result = matchNode.node.value;
        if (result != null) {
          results.push(result);
        }
      }
    }
    if (this.defaultValue != null) {
      results.push(this.defaultValue);
    }
    return results;
  }

  public push(options: Options, value: V, replace = true): boolean {
    const match = this.findMatchValue(options, 0);
    if (match) {
      const { roots } = this;
      const [matchKey, matchValue, index] = match;
      const { key } = matchKey;
      let targetNode = roots.find((v) => isSameNode(v, key, matchValue));
      if (!targetNode) {
        targetNode = this.createNode(matchKey, matchValue, undefined);
        roots.push(targetNode);
      }
      const nextIndex = index + 1;
      const nextMatch = this.findMatchValue(options, nextIndex);
      if (nextMatch) {
        return this.pushIteration(nextMatch, targetNode, options, value, replace);
      }
      if (targetNode.value == null || replace) {
        targetNode.value = value;
        targetNode.priority = options.priority;
        return true;
      }
    } else if (this.defaultValue == null || replace) {
      this.defaultValue = value;
      return true;
    }
    return false;
  }

  private createNode(
    matchKey: InternalMatchKey,
    matchValue: MatchValues,
    parent: NodeType<V> | undefined,
    value?: V,
    priority?: number
  ): NodeType<V> {
    let level: number;
    if (parent) {
      level = parent.level + 1;
    } else {
      level = 1;
    }
    const multi = isMatchArrayValue(matchValue);
    if (multi) {
      return {
        matchKey,
        multi: true,
        matchValues: matchValue.sort(),
        value,
        parent,
        children: [],
        level,
        index: this.counter++,
        priority
      } as MultiValueNode<V>;
    }
    return {
      matchKey,
      multi: false,
      matchValue,
      value,
      parent,
      children: [],
      level,
      index: this.counter++,
      priority
    } as SingleValueNode<V>;
  }

  /**
   * 从指定键值索引开始查找最近一个不为空的可选项值
   * @param options 可选项
   * @param fromIndex 查找索引
   * @param matchAnyValue 匹配任意值
   * @return [匹配键, 可选项值, 当前索引]
   * @private
   */
  private findMatchValue(options: Options, fromIndex: number, matchAnyValue = false): MatchResult | undefined {
    const { matchKeys, keyLength } = this;
    for (; fromIndex < keyLength; fromIndex++) {
      const matchKey = matchKeys[fromIndex];
      const value = options[matchKey.key];
      if (isMatchAnyValue(value)) {
        if (matchAnyValue) {
          return [matchKey, value, fromIndex];
        }
        return undefined;
      }
      if (value == null) {
        continue;
      }
      if (typeof value === 'string') {
        if (!value) {
          continue;
        }
        return [matchKey, value, fromIndex];
      }
      if (Array.isArray(value)) {
        const length = value.length;
        if (!length) {
          continue;
        }
        if (length === 1) {
          return [matchKey, value[0], fromIndex];
        }
        return [matchKey, value.sort(), fromIndex];
      }
      return [matchKey, value, fromIndex];
    }
  }

  private pushIteration(match: MatchResult, node: NodeType<V>, options: Options, value: V, replace: boolean): boolean {
    const [matchKey, matchValue, index] = match;
    const { key } = matchKey;
    const nextIndex = index + 1;
    const { children } = node;
    let targetNode = children.find((v) => isSameNode(v, key, matchValue));
    if (!targetNode) {
      targetNode = this.createNode(matchKey, matchValue, node);
      children.push(targetNode);
    }
    const nextMatch = this.findMatchValue(options, nextIndex);
    if (nextMatch) {
      return this.pushIteration(nextMatch, targetNode, options, value, replace);
    }
    if (targetNode.value == null || replace) {
      targetNode.value = value;
      return true;
    }
    return false;
  }

  private findMatchNode(nodes: NodeType<V>[], options: Options): MatchNode<V> | undefined {
    return this.$findMatchNode(nodes, options, {
      fromIndex: 0,
      currentWeight: 0
    });
  }

  private $findMatchNode(nodes: NodeType<V>[], options: Options, context: MatchContext): MatchNode<V> | undefined {
    if (!nodes.length) {
      return undefined;
    }
    const { fromIndex, currentWeight } = context;
    const match = this.findMatchValue(options, fromIndex, true);
    if (!match) {
      return undefined;
    }
    const [matchKey, matchValue, index] = match;
    const nextFromIndex = index + 1;
    let currentMatchNode: MatchNode<V> | undefined;
    for (const node of nodes) {
      const [matchResult, matchCount] = isMatch(node, matchKey, matchValue);
      if (!matchResult) {
        continue;
      }
      const nextWeight = currentWeight + matchKey.weight;
      let lastedMatchNode: MatchNode<V> | undefined;
      if (currentMatchNode) {
        const nextMatchNode: MatchNode<V> = {
          node,
          weight: nextWeight,
          matchCount
        };
        switch (compareFn(currentMatchNode, nextMatchNode)) {
          case 0:
          case 1:
            lastedMatchNode = currentMatchNode;
            currentMatchNode = nextMatchNode;
            break;
        }
      } else {
        currentMatchNode = {
          node,
          weight: nextWeight,
          matchCount
        };
      }
      const nextMatchNode = this.$findMatchNode(node.children, options, {
        fromIndex: nextFromIndex,
        currentWeight: nextWeight
      });
      if (nextMatchNode) {
        switch (compareFn(currentMatchNode, nextMatchNode)) {
          case 0:
          case 1:
            lastedMatchNode = currentMatchNode;
            currentMatchNode = nextMatchNode;
            break;
        }
      } else if (currentMatchNode.node.value == null) {
        currentMatchNode = lastedMatchNode;
      }
    }
    if (nextFromIndex < this.keyLength) {
      const nextMatchNode = this.$findMatchNode(nodes, options, {
        fromIndex: nextFromIndex,
        currentWeight
      });
      if (currentMatchNode?.node.value == null) {
        return nextMatchNode;
      }
      if (nextMatchNode) {
        switch (compareFn(currentMatchNode, nextMatchNode)) {
          case 0:
          case 1:
            return nextMatchNode;
          case -1:
            return currentMatchNode;
        }
      }
    }
    return currentMatchNode;
  }

  private findMatchNodes(nodes: NodeType<V>[], options: Options): MatchNode<V>[] | undefined {
    return this.$findMatchNodes(nodes, options, {
      fromIndex: 0,
      currentWeight: 0
    });
  }

  private $findMatchNodes(nodes: NodeType<V>[], options: Options, context: MatchContext): MatchNode<V>[] | undefined {
    if (!nodes.length) {
      return undefined;
    }
    const { fromIndex, currentWeight } = context;
    const match = this.findMatchValue(options, fromIndex, true);
    if (!match) {
      return undefined;
    }
    const [matchKey, matchValue, index] = match;
    const nextFromIndex = index + 1;
    let matchNodes: MatchNode<V>[] = [];
    for (const node of nodes) {
      const [matchResult, matchCount] = isMatch(node, matchKey, matchValue);
      if (!matchResult) {
        continue;
      }
      const nextWeight = currentWeight + matchKey.weight;
      const nextMatchNodes = this.$findMatchNodes(node.children, options, {
        fromIndex: nextFromIndex,
        currentWeight: nextWeight
      });
      if (nextMatchNodes?.length) {
        matchNodes = [...nextMatchNodes, ...matchNodes];
      }
      if (node.value != null) {
        matchNodes.push({
          node,
          weight: nextWeight,
          matchCount
        });
      }
    }
    if (nextFromIndex < this.keyLength) {
      const nextMatchNodes = this.$findMatchNodes(nodes, options, {
        fromIndex: nextFromIndex,
        currentWeight
      });
      if (nextMatchNodes?.length) {
        matchNodes = [...nextMatchNodes, ...matchNodes];
      }
    }
    return matchNodes;
  }
}

function isSameNode(node: NodeType<unknown>, key: string, matchValue: MatchValues) {
  if (node.matchKey.key !== key) {
    return false;
  }
  if (isMultiValueNode(node)) {
    return JSON.stringify(node.matchValues) === JSON.stringify(matchValue);
  }
  return JSON.stringify(node.matchValue) === JSON.stringify(matchValue);
}

function verifyKey(key: string): string {
  key = key.trim();
  if (!key.length) {
    throw new Error(`Invalid key. The key must not be blank. ${key}`);
  }
  return key;
}

function verifyWeight(weight: number): number {
  if (!Number.isInteger(weight) || weight < 1) {
    throw new Error(`Invalid weight. Weight must be an integer and greater than or equal to 1.  ${weight}`);
  }
  return weight;
}
