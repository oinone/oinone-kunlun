import { isString } from 'lodash-es';
import { BiConverter, Consumer, Converter } from './LambdaFunction';

/**
 * 标准树节点
 */
export interface StandardTreeNode<T, SELF extends StandardTreeNode<T, SELF>> {
  /**
   * 唯一键
   */
  key: string;
  /**
   * 值
   */
  value?: T;
  /**
   * 上级节点
   */
  parent?: SELF;
  /**
   * 子节点列表
   */
  children: SELF[];
  /**
   * 是否叶节点
   */
  isLeaf: boolean;
  /**
   * 节点所在层级
   */
  level?: number;

  /**
   * <h3>设置父节点</h3>
   * <p>
   * 设置父节点时，根据当前树的构建需要进行实现
   * </p>
   * <p>
   * 默认设置父节点方法请直接使用{@link TreeNode#setParent}方法
   * </p>
   * @param value
   * @param position
   */
  setParent?(value: SELF | undefined, position?: number);
}

/**
 * 树节点构造函数
 */
export type TreeNodeConstructor<V, NODE extends StandardTreeNode<V, NODE> = TreeNode<V>> = (
  key: string,
  value?: V,
  parent?: NODE
) => NODE;

export type TreeNodeUpdateValue<V, NODE extends StandardTreeNode<V, NODE> = TreeNode<V>> = (
  node: NODE,
  value: V
) => NODE;

/**
 * 默认标准树节点
 */
export class TreeNode<T> implements StandardTreeNode<T, TreeNode<T>> {
  constructor(key: string, value?: T | undefined, parent?: TreeNode<T> | undefined) {
    this.key = key;
    this.value = value;
    this.setParent(parent);
  }

  public key: string;

  public value: T | undefined;

  public parent: TreeNode<T> | undefined;

  public children: TreeNode<T>[] = [];

  public isLeaf = true;

  public level = 1;

  public static newInstance<V>(key: string, value?: V, parent?: TreeNode<V>) {
    return new TreeNode(key, value, parent);
  }

  /**
   * <h3>设置父节点</h3>
   * <p>
   * 1. 在当前节点的父节点上移除自己
   * 2. 设置当前节点的新的父节点
   * 3. 将当前节点加入到指定父节点中，若指定插入位置时，将在父节点的子节点列表中的对应位置插入当前节点
   * </p>
   * @param value
   * @param position
   */
  public setParent(value: TreeNode<T> | undefined, position?: number | undefined) {
    removeChildInParentForThis.bind(this)(this.parent);
    this.parent = value;
    addChildForParent.bind(this)(this.parent, position);
  }

  public addChild(value: TreeNode<T> | undefined, position?: number | undefined) {
    if (value) {
      value.setParent(this, position);
    }
  }

  public removeChild(value: TreeNode<T> | undefined) {
    if (value) {
      value.setParent(undefined);
    }
  }

  public removeChildByKey(value: string | undefined) {
    if (value) {
      const selected: TreeNode<T> | undefined = this.children.find((v) => v.key === value);
      if (selected) {
        selected.setParent(undefined);
      }
    }
  }
}

function addChildForParent<V, NODE extends StandardTreeNode<V, NODE>>(
  this: NODE,
  parent: NODE | undefined,
  position: number | undefined
) {
  if (parent) {
    if (position == null || parent.children.length < position) {
      parent.children.push(this);
    } else {
      parent.children.splice(position, 0, this);
    }
    parent.isLeaf = false;
    this.level = (parent.level || 0) + 1;
    resetChildrenLevel.bind(this)(this.children, this.level);
  }
}

function removeChildInParentForThis<V, NODE extends StandardTreeNode<V, NODE>>(this, parent: NODE | undefined) {
  if (parent) {
    parent.children.splice(parent.children.indexOf(this), 1);
    if (parent.children.length === 0) {
      parent.isLeaf = true;
    }
    this.level = 1;
    resetChildrenLevel.bind(this)(this.children, 1);
  }
}

const MAX_COUNT = 20;

function resetChildrenLevel<V, NODE extends StandardTreeNode<V, NODE>>(this, children: NODE[], initial: number) {
  const newLevel = initial + 1;
  if (newLevel > MAX_COUNT) {
    console.warn('resetChildrenLevel max count', MAX_COUNT, newLevel);
    return;
  }
  for (const child of children) {
    if (child.level === newLevel) {
      return;
    }
    child.level = newLevel;

    const repeatList = child.children.filter((a) => a.key === child.parent?.key);
    if (repeatList.length) {
      // 出现了2个元素互为父子的情况，会触发无限循环
      console.warn('resetChildrenLevel repeatList', repeatList);
      return;
    }
    resetChildrenLevel.bind(this)(child.children, newLevel);
  }
}

export class TreeHelper {
  public static convert<T, R, NODE extends StandardTreeNode<R, NODE> = TreeNode<R>>(
    list: T[],
    keyGenerator: BiConverter<T, R, string | undefined>,
    parentKeyGenerator: Converter<T, string | string[] | undefined>,
    converter: Converter<T, R | undefined> = (v) => v as unknown as R,
    newNodeInstance: TreeNodeConstructor<R, NODE> = TreeNode.newInstance as unknown as TreeNodeConstructor<R, NODE>,
    updateNodeInstance: TreeNodeUpdateValue<R, NODE> = (node) => node
  ): NODE[] {
    if (!list || list.length === 0) {
      return [];
    }
    const rootMap = new Map<string, NODE>();
    const childrenMap = new Map<string, NODE>();
    for (const originTreeNode of list) {
      const value: R | undefined = converter(originTreeNode);
      if (!value) {
        continue;
      }
      const key: string | undefined = keyGenerator(originTreeNode, value);
      if (!key) {
        continue;
      }
      let currentNode: NODE | undefined = TreeHelper.singleNodeVGS(
        rootMap,
        childrenMap,
        key,
        value,
        updateNodeInstance
      );
      const generatorParentKeys: string | string[] | undefined = parentKeyGenerator(originTreeNode);
      let hasParentKey = true;
      if (generatorParentKeys) {
        let parentKey: string | undefined;
        if (isString(generatorParentKeys)) {
          parentKey = generatorParentKeys;
        } else if (generatorParentKeys.length) {
          if (generatorParentKeys.length === 1) {
            [parentKey] = generatorParentKeys;
          }
        } else {
          hasParentKey = false;
        }
        if (hasParentKey) {
          if (parentKey) {
            const parent = TreeHelper.generatorParentNode(rootMap, childrenMap, parentKey, newNodeInstance);
            if (currentNode) {
              if (currentNode.parent) {
                throw new Error(
                  `一个节点只能有一个父节点: [CurrentNodeKey ${key}] [CurrentParentNodeKey ${parentKey}]`
                );
              } else if (currentNode.setParent) {
                currentNode.setParent(parent, undefined);
              } else {
                currentNode.parent = parent;
              }
            } else {
              currentNode = newNodeInstance(key, value, parent);
              childrenMap.set(key, currentNode);
            }
          } else {
            const parentKeys = generatorParentKeys as string[];
            for (const multipleParentKey of parentKeys) {
              const parent = TreeHelper.generatorParentNode(rootMap, childrenMap, multipleParentKey, newNodeInstance);
              if (currentNode) {
                if (currentNode.parent) {
                  throw new Error(
                    `一个节点只能有一个父节点: [CurrentNodeKey ${key}] [CurrentParentNodeKey ${parentKey}]`
                  );
                } else if (currentNode.setParent) {
                  currentNode.setParent(parent, undefined);
                } else {
                  currentNode.parent = parent;
                }
                currentNode = undefined;
              } else {
                const newCurrentNode = newNodeInstance(key, value, parent);
                childrenMap.set(key, newCurrentNode);
              }
            }
          }
        }
      } else {
        hasParentKey = false;
      }
      if (!hasParentKey) {
        if (!currentNode) {
          currentNode = newNodeInstance(key, value);
        }
        rootMap.set(key, currentNode);
      }
    }
    return Array.from(rootMap.values());
  }

  private static generatorParentNode<R, NODE extends StandardTreeNode<R, NODE>>(
    rootMap: Map<string, NODE>,
    childrenMap: Map<string, NODE>,
    key: string,
    newNodeInstance: TreeNodeConstructor<R, NODE>
  ) {
    let parent: NODE | undefined = rootMap.get(key);
    if (!parent) {
      parent = childrenMap.get(key);
    }
    if (!parent) {
      parent = newNodeInstance(key);
      childrenMap.set(key, parent);
    }
    return parent;
  }

  private static singleNodeVGS<R, NODE extends StandardTreeNode<R, NODE> = TreeNode<R>>(
    rootMap: Map<string, NODE>,
    childrenMap: Map<string, NODE>,
    key: string,
    value: R,
    updateNodeInstance: TreeNodeUpdateValue<R, NODE>
  ): NODE | undefined {
    let currentNode: NODE | undefined = rootMap.get(key);
    if (!currentNode) {
      currentNode = childrenMap.get(key);
    }
    if (currentNode) {
      if (currentNode.value) {
        throw new Error(`不允许出现重复的节点键值: [CurrentNodeKey ${key}]`);
      } else {
        currentNode.value = value;
        updateNodeInstance(currentNode, value);
      }
    }
    return currentNode;
  }

  public static traversal<R>(list: TreeNode<R>[], callback: Consumer<TreeNode<R>>): void {
    if (!list) {
      return;
    }
    list.forEach((v) => {
      callback(v);
      TreeHelper.traversal(v.children, callback);
    });
  }

  public static find<R>(list: TreeNode<R>[], predict: (node: TreeNode<R>) => boolean): TreeNode<R> | undefined {
    for (const node of list) {
      if (predict(node)) {
        return node;
      }
      const target = TreeHelper.find(node.children || [], predict);
      if (target) {
        return target;
      }
    }
  }
}
