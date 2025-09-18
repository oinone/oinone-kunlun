import { OioTreeNode } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';

type Options = {
  isDiff?: () => boolean | undefined;
};

export function useTreeChecked(
  state: {
    mode: SelectMode;
    checkedKeys: string[];
    checkedNodes: OioTreeNode[];
  },
  options?: Options
) {
  if (state.mode === SelectMode.single) {
    return useSingleTreeChecked(state);
  }
  return useMultipleTreeChecked(state, options);
}

interface State {
  checkedKeys: string[];
  checkedNodes: OioTreeNode[];
}

function useMultipleTreeChecked(state: State, options?: Options) {
  const onChecked = (node: OioTreeNode, checked: boolean) => {
    $$updateChecked(node, checked);
    state.checkedKeys = [...state.checkedKeys];
  };

  const onCheckedStrictly = (node: OioTreeNode, checked: boolean) => {
    $$checkedStrictly(node, checked);
    state.checkedKeys = [...state.checkedKeys];
  };

  const $$checkedStrictly = (node: OioTreeNode, checked: boolean) => {
    $$updateChecked(node, checked);
    $$updateChildren(node.children, checked);
    if (node.parent) {
      $$updateParent(node.parent);
    }
  };

  const $$updateChecked = (node: OioTreeNode, checked: boolean) => {
    if (node.checked === checked) {
      return;
    }
    node.checked = checked;
    node.halfChecked = false;
    if (checked) {
      state.checkedKeys.push(node.key);
      state.checkedNodes.push(node);
    } else {
      const index = state.checkedKeys.indexOf(node.key);
      if (index > -1) {
        state.checkedKeys.splice(index, 1);
        state.checkedNodes.splice(index, 1);
      }
    }
  };

  const $$updateChildren = (nodes: OioTreeNode[], checked: boolean) => {
    for (const node of nodes) {
      $$updateChecked(node, checked);
      $$updateChildren(node.children, checked);
    }
  };

  const $$updateParent = (node: OioTreeNode) => {
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
      $$updateChecked(node, true);
    } else {
      $$updateChecked(node, false);
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
        $$updateCheckedAll(nodes, nextState);
        for (let i = 0; i < nextState.checkedKeys.length; i++) {
          const checkedKey = nextState.checkedKeys[i];
          if (state.checkedKeys.indexOf(checkedKey) <= -1) {
            state.checkedKeys.push(checkedKey);
            state.checkedNodes.push(nextState.checkedNodes[i]);
          }
        }
      } else {
        const uncheckedKeys: string[] = [];
        $$updateUncheckedAll(nodes, uncheckedKeys);
        for (const checkedKey of uncheckedKeys) {
          const index = state.checkedKeys.indexOf(checkedKey);
          if (index !== -1) {
            state.checkedKeys.splice(index, 1);
            state.checkedNodes.splice(index, 1);
          }
        }
      }
      state.checkedKeys = [...state.checkedKeys];
    } else {
      $$checkedAll(nodes, checked);
    }
  };

  const $$checkedAll = (nodes: OioTreeNode[], checked: boolean) => {
    if (checked) {
      const nextState = { checkedKeys: [], checkedNodes: [] };
      $$updateCheckedAll(nodes, nextState);
      state.checkedKeys = nextState.checkedKeys;
      state.checkedNodes = nextState.checkedNodes;
    } else {
      $$updateUncheckedAll(nodes);
      state.checkedKeys = [];
      state.checkedNodes = [];
    }
  };

  const $$updateCheckedAll = (nodes: OioTreeNode[], nextState: State) => {
    for (const node of nodes) {
      nextState.checkedKeys.push(node.key);
      nextState.checkedNodes.push(node);
      node.checked = true;
      node.halfChecked = false;
      $$updateCheckedAll(node.children, nextState);
    }
  };

  const $$updateUncheckedAll = (nodes: OioTreeNode[], uncheckedKeys?: string[]) => {
    for (const node of nodes) {
      uncheckedKeys?.push(node.key);
      node.checked = false;
      node.halfChecked = false;
      $$updateUncheckedAll(node.children, uncheckedKeys);
    }
  };

  const onRefreshCheckedState = (nodes: OioTreeNode[], checkedKeys: string[]) => {
    const nextState: State = { checkedKeys: [], checkedNodes: [] };
    $$refreshCheckedState(nodes, checkedKeys, nextState);
    state.checkedKeys = nextState.checkedKeys;
    state.checkedNodes = nextState.checkedNodes;
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
