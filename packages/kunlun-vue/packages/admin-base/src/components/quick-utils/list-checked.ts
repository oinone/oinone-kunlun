import { OioListItem } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';

export function useListChecked(state: { mode: SelectMode; checkedKeys: string[] }) {
  if (state.mode === SelectMode.single) {
    return useSingleListChecked(state);
  }
  return useMultipleListChecked(state);
}

function useMultipleListChecked(state: { checkedKeys: string[] }) {
  const onChecked = (item: OioListItem, checked: boolean) => {
    $$updateChecked(item, checked);
  };

  const $$updateChecked = (item: OioListItem, checked: boolean) => {
    if (item.checked === checked) {
      return;
    }
    item.checked = checked;
    if (checked) {
      state.checkedKeys.push(item.key);
    } else {
      const index = state.checkedKeys.indexOf(item.key);
      if (index > -1) {
        state.checkedKeys.splice(index, 1);
      }
    }
  };

  const onCheckedAll = (items: OioListItem[], checked: boolean) => {
    if (checked) {
      const nextCheckedKeys = [];
      $$updateCheckedAll(items, nextCheckedKeys);
      state.checkedKeys = nextCheckedKeys;
    } else {
      $$updateUncheckedAll(items);
      state.checkedKeys = [];
    }
  };

  const $$updateCheckedAll = (items: OioListItem[], checkedKeys: string[]) => {
    for (const item of items) {
      checkedKeys.push(item.key);
      item.checked = true;
    }
  };

  const $$updateUncheckedAll = (items: OioListItem[]) => {
    for (const item of items) {
      item.checked = false;
    }
  };

  return {
    onChecked,
    onCheckedAll
  };
}

function useSingleListChecked(state: { checkedKeys: string[] }) {
  const onChecked = (item: OioListItem, checked: boolean) => {
    $$updateChecked(item, checked);
  };

  const $$updateChecked = (item: OioListItem, checked: boolean) => {
    if (item.key === state.checkedKeys[0]) {
      return;
    }
    if (checked) {
      state.checkedKeys = [item.key];
    }
  };

  const onCheckedAll = (items: OioListItem[], checked: boolean) => {
    console.error('this method is unsupported. cause: mode is multiple.');
  };

  return {
    onChecked,
    onCheckedAll
  };
}
