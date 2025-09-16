import { OioTreeNode } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';

type Options = {
  hasFilter?: () => boolean;
};

export function useTreeChecked(state: { mode: SelectMode; checkedKeys: string[] }, options?: Options) {
  if (state.mode === SelectMode.single) {
    return useSingleTreeChecked(state);
  }
  return useMultipleTreeChecked(state, options);
}

function useMultipleTreeChecked(state: { checkedKeys: string[] }, options?: Options) {
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
    } else {
      const index = state.checkedKeys.indexOf(node.key);
      if (index > -1) {
        state.checkedKeys.splice(index, 1);
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
        $$updateCheckedAll(nodes, checkedKeys);
        for (const checkedKey of checkedKeys) {
          if (state.checkedKeys.indexOf(checkedKey) <= -1) {
            state.checkedKeys.push(checkedKey);
          }
        }
      } else {
        const uncheckedKeys: string[] = [];
        $$updateUncheckedAll(nodes, uncheckedKeys);
        for (const checkedKey of uncheckedKeys) {
          const index = state.checkedKeys.indexOf(checkedKey);
          if (index !== -1) {
            state.checkedKeys.splice(index, 1);
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
      $$updateCheckedAll(nodes, nextCheckedKeys);
      state.checkedKeys = nextCheckedKeys;
    } else {
      $$updateUncheckedAll(nodes);
      state.checkedKeys = [];
    }
  };

  const $$updateCheckedAll = (nodes: OioTreeNode[], checkedKeys: string[]) => {
    for (const node of nodes) {
      checkedKeys.push(node.key);
      node.checked = true;
      node.halfChecked = false;
      $$updateCheckedAll(node.children, checkedKeys);
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
    $$updateParent
  };
}

function useSingleTreeChecked(state: { checkedKeys: string[] }) {
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
    }
  };

  const $$updateParent = (node: OioTreeNode) => {
    console.error('this method is unsupported. cause: mode is multiple.');
  };

  const onCheckedAll = (nodes: OioTreeNode[], checked: boolean) => {
    console.error('this method is unsupported. cause: mode is multiple.');
  };

  return {
    onChecked,
    onCheckedStrictly,
    onCheckedAll,
    $$updateParent
  };
}
