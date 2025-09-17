import { OioTreeNode } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';

type Options = {
  hasFilter?: () => boolean;
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
  };

  const onCheckedStrictly = (node: OioTreeNode, checked: boolean) => {
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
    const hasFilter = options?.hasFilter?.();
    if (hasFilter) {
      if (checked) {
        const checkedKeys: string[] = [];
        const checkedNodes: OioTreeNode[] = [];
        $$updateCheckedAll(nodes, checkedKeys, checkedNodes);
        for (let i = 0; i < checkedKeys.length; i++) {
          const checkedKey = checkedKeys[i];
          if (state.checkedKeys.indexOf(checkedKey) <= -1) {
            state.checkedKeys.push(checkedKey);
            state.checkedNodes.push(checkedNodes[i]);
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
    } else {
      $$checkedAll(nodes, checked);
    }
  };

  const $$checkedAll = (nodes: OioTreeNode[], checked: boolean) => {
    if (checked) {
      const nextCheckedKeys = [];
      const nextCheckedNodes = [];
      $$updateCheckedAll(nodes, nextCheckedKeys, nextCheckedNodes);
      state.checkedKeys = nextCheckedKeys;
      state.checkedNodes = nextCheckedNodes;
    } else {
      $$updateUncheckedAll(nodes);
      state.checkedKeys = [];
      state.checkedNodes = [];
    }
  };

  const $$updateCheckedAll = (nodes: OioTreeNode[], checkedKeys: string[], checkedNodes: OioTreeNode[]) => {
    for (const node of nodes) {
      checkedKeys.push(node.key);
      checkedNodes.push(node);
      node.checked = true;
      node.halfChecked = false;
      $$updateCheckedAll(node.children, checkedKeys, checkedNodes);
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

  return {
    onChecked,
    onCheckedStrictly,
    onCheckedAll,
    $$updateParent,
    ...useRefreshCheckedState(state)
  };
}

function useSingleTreeChecked(state: State) {
  const onChecked = (node: OioTreeNode, checked: boolean) => {
    $$updateChecked(node, checked);
  };

  const onCheckedStrictly = (node: OioTreeNode, checked: boolean) => {
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

  const $$updateParent = (node: OioTreeNode) => {
    console.error('this method is unsupported. cause: mode is single.');
  };

  const onCheckedAll = (nodes: OioTreeNode[], checked: boolean) => {
    console.error('this method is unsupported. cause: mode is single.');
  };

  return {
    onChecked,
    onCheckedStrictly,
    onCheckedAll,
    $$updateParent,
    ...useRefreshCheckedState(state)
  };
}

function useRefreshCheckedState(state: State) {
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
      }
      node.halfChecked = !!node.parent?.checked;
      $$refreshCheckedState(node.children, checkedKeys, newState);
    }
  };

  return {
    onRefreshCheckedState
  };
}
