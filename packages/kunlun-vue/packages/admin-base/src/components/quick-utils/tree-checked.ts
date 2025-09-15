import { OioTreeNode } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';

export function useTreeChecked(state: { mode: SelectMode; checkedKeys: string[] }) {
  if (state.mode === SelectMode.single) {
    return useSingleTreeChecked(state);
  }
  return useMultipleTreeChecked(state);
}

function useMultipleTreeChecked(state: { checkedKeys: string[] }) {
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

  const $$updateUncheckedAll = (nodes: OioTreeNode[]) => {
    for (const node of nodes) {
      node.checked = false;
      node.halfChecked = false;
      $$updateUncheckedAll(node.children);
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
