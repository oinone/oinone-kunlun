import { OioTreeNode } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';

type Options = {
  isDiff?: () => boolean | undefined;
};

export function useTreeChecked(
  state: {
    mode: SelectMode;
  } & InitState,
  options?: Options
) {
  if (state.mode === SelectMode.single) {
    return useSingleTreeChecked(state);
  }
  return useMultipleTreeChecked(state, options);
}

type InitState = {
  storage: Record<string, OioTreeNode>;
} & State;

type State = {
  checkedKeys: string[];
  checkedNodes: OioTreeNode[];
  lastCheckedKeys?: string[];
  lastCheckedNodes?: OioTreeNode[];
  submitCheckedKeys?: string[];
  submitCheckedNodes?: OioTreeNode[];
};

function useMultipleTreeChecked(initState: InitState, options?: Options) {
  const onChecked = (node: OioTreeNode, checked: boolean) => {
    $$updateChecked(node, checked, options?.isDiff?.());
    initState.checkedKeys = [...initState.checkedKeys];
  };

  const onCheckedStrictly = (node: OioTreeNode, checked: boolean) => {
    $$checkedStrictly(node, checked, options?.isDiff?.());
    initState.checkedKeys = [...initState.checkedKeys];
  };

  const $$checkedStrictly = (node: OioTreeNode, checked: boolean, usingOrigin?: boolean) => {
    $$updateChecked(node, checked, usingOrigin);
    $$updateChildren(node.children, checked, usingOrigin);
    if (node.parent) {
      $$updateParent(node.parent, usingOrigin);
    }
  };

  const $$updateChecked = (node: OioTreeNode, checked: boolean, usingOrigin?: boolean) => {
    if (node.checked === checked) {
      return;
    }
    const { key } = node;
    if (usingOrigin) {
      const originNode = initState.storage[key];
      originNode.checked = checked;
      originNode.halfChecked = false;
    }
    node.checked = checked;
    node.halfChecked = false;
    if (checked) {
      initState.checkedKeys.push(key);
      initState.checkedNodes.push(node);
    } else {
      const index = initState.checkedKeys.indexOf(key);
      if (index > -1) {
        initState.checkedKeys.splice(index, 1);
        initState.checkedNodes.splice(index, 1);
      }
    }
  };

  const $$updateChildren = (nodes: OioTreeNode[], checked: boolean, usingOrigin?: boolean) => {
    for (const node of nodes) {
      $$updateChecked(node, checked, usingOrigin);
      $$updateChildren(node.children, checked, usingOrigin);
    }
  };

  const $$updateParent = (node: OioTreeNode, usingOrigin?: boolean) => {
    let checkedCount = node.children.length;
    let halfChecked = false;
    for (const child of node.children) {
      if (!halfChecked) {
        halfChecked = !!child.checked || !!child.halfChecked;
      }
      if (child.checked) {
        checkedCount--;
      }
    }
    if (checkedCount === 0) {
      $$updateChecked(node, true, usingOrigin);
    } else {
      $$updateChecked(node, false, usingOrigin);
      if (usingOrigin) {
        const originNode = initState.storage[node.key];
        originNode.halfChecked = halfChecked;
      }
      node.halfChecked = halfChecked;
    }
    if (node.parent) {
      $$updateParent(node.parent);
    }
  };

  const onCheckedAll = (nodes: OioTreeNode[], checked: boolean) => {
    const isDiff = options?.isDiff?.();
    if (isDiff) {
      if (checked) {
        const nextState: State = { checkedKeys: [], checkedNodes: [] };
        $$updateCheckedAll(nodes, nextState, true);
        for (let i = 0; i < nextState.checkedKeys.length; i++) {
          const checkedKey = nextState.checkedKeys[i];
          if (initState.checkedKeys.indexOf(checkedKey) <= -1) {
            initState.checkedKeys.push(checkedKey);
            initState.checkedNodes.push(nextState.checkedNodes[i]);
          }
        }
      } else {
        const uncheckedKeys: string[] = [];
        $$updateUncheckedAll(nodes, uncheckedKeys, true);
        for (const checkedKey of uncheckedKeys) {
          const index = initState.checkedKeys.indexOf(checkedKey);
          if (index !== -1) {
            initState.checkedKeys.splice(index, 1);
            initState.checkedNodes.splice(index, 1);
          }
        }
      }
      initState.checkedKeys = [...initState.checkedKeys];
    } else {
      $$checkedAll(nodes, checked);
    }
  };

  const $$checkedAll = (nodes: OioTreeNode[], checked: boolean) => {
    if (checked) {
      const nextState = { checkedKeys: [], checkedNodes: [] };
      $$updateCheckedAll(nodes, nextState);
      initState.checkedKeys = nextState.checkedKeys;
      initState.checkedNodes = nextState.checkedNodes;
    } else {
      $$updateUncheckedAll(nodes);
      initState.checkedKeys = [];
      initState.checkedNodes = [];
    }
  };

  const $$updateCheckedAll = (nodes: OioTreeNode[], nextState: State, usingOrigin?: boolean) => {
    for (const node of nodes) {
      const { key } = node;
      nextState.checkedKeys.push(key);
      nextState.checkedNodes.push(node);
      if (usingOrigin) {
        const originNode = initState.storage[key];
        originNode.checked = true;
        originNode.halfChecked = false;
      }
      node.checked = true;
      node.halfChecked = false;
      $$updateCheckedAll(node.children, nextState);
    }
  };

  const $$updateUncheckedAll = (nodes: OioTreeNode[], uncheckedKeys?: string[], usingOrigin?: boolean) => {
    for (const node of nodes) {
      const { key } = node;
      uncheckedKeys?.push(key);
      if (usingOrigin) {
        const originNode = initState.storage[key];
        originNode.checked = false;
        originNode.halfChecked = false;
      }
      node.checked = false;
      node.halfChecked = false;
      $$updateUncheckedAll(node.children, uncheckedKeys);
    }
  };

  const onRefreshCheckedState = (nodes: OioTreeNode[], checkedKeys: string[]) => {
    const nextState: State = { checkedKeys: [], checkedNodes: [] };
    $$refreshCheckedState(nodes, checkedKeys, nextState);
    initState.checkedKeys = nextState.checkedKeys;
    initState.checkedNodes = nextState.checkedNodes;
  };

  const $$refreshCheckedState = (nodes: OioTreeNode[], checkedKeys: string[], newState: State) => {
    for (const node of nodes) {
      const checked = checkedKeys.includes(node.key);
      node.checked = checked;
      if (checked) {
        newState.checkedKeys.push(node.key);
        newState.checkedNodes.push(node);
        if (node.parent) {
          if (!node.parent.checked) {
            node.parent.halfChecked = true;
          }
        }
      }
      node.halfChecked = false;
      $$refreshCheckedState(node.children, checkedKeys, newState);
    }
  };

  return {
    onChecked,
    onCheckedStrictly,
    $$checkedStrictly,
    onCheckedAll,
    onRefreshCheckedState
  };
}

function useSingleTreeChecked(state: State) {
  const onChecked = (node: OioTreeNode, checked: boolean) => {
    $$updateChecked(node, checked);
  };

  const onCheckedStrictly = (node: OioTreeNode, checked: boolean) => {
    onChecked(node, checked);
  };

  const $$checkedStrictly = (node: OioTreeNode, checked: boolean) => {
    onChecked(node, checked);
  };

  const $$updateChecked = (node: OioTreeNode, checked: boolean) => {
    if (node.key === state.checkedKeys[0]) {
      return;
    }
    if (checked) {
      state.checkedKeys = [node.key];
      state.checkedNodes = [node];
    }
  };

  const onCheckedAll = (nodes: OioTreeNode[], checked: boolean) => {
    console.error('this method is unsupported. cause: mode is single.');
  };

  const onRefreshCheckedState = (nodes: OioTreeNode[], checkedKeys: string[]) => {
    const nextState: State = { checkedKeys: [], checkedNodes: [] };
    $$refreshCheckedState(nodes, checkedKeys?.[0], nextState);
    state.checkedKeys = nextState.checkedKeys;
    state.checkedNodes = nextState.checkedNodes;
  };

  const $$refreshCheckedState = (nodes: OioTreeNode[], checkedKey: string, newState: State) => {
    for (const node of nodes) {
      const checked = node.key === checkedKey;
      node.checked = checked;
      if (checked) {
        newState.checkedKeys.push(node.key);
        newState.checkedNodes.push(node);
        return;
      }
      $$refreshCheckedState(node.children, checkedKey, newState);
    }
  };

  return {
    onChecked,
    onCheckedStrictly,
    $$checkedStrictly,
    onCheckedAll,
    onRefreshCheckedState
  };
}
