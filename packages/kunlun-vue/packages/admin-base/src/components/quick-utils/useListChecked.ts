import type { OioListItem } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';

type Options = {
  isDiff?: () => boolean | undefined;
};

export function useListChecked(
  state: {
    mode: SelectMode;
  } & InitState,
  options?: Options
) {
  if (state.mode === SelectMode.single) {
    return useSingleListChecked(state);
  }
  return useMultipleListChecked(state, options);
}

type InitState = {
  storage: Record<string, OioListItem>;
} & State;

type State = {
  checkedKeys: string[];
  checkedItems: OioListItem[];
  lastCheckedKeys?: string[];
  lastCheckedItems?: OioListItem[];
  submitCheckedKeys?: string[];
  submitCheckedItems?: OioListItem[];
};

function useMultipleListChecked(initState: InitState, options?: Options) {
  const onChecked = (item: OioListItem, checked: boolean) => {
    const { lastCheckedKeys, lastCheckedItems } = initState;
    if (lastCheckedKeys && lastCheckedItems) {
      $$updateCheckedByLastCheckedKeys(lastCheckedKeys, lastCheckedItems, [item], checked);
    } else {
      $$updateChecked(initState, item, checked);
      initState.checkedKeys = [...initState.checkedKeys];
    }
  };

  const $$updateChecked = (state: State, item: OioListItem, checked: boolean) => {
    if (item.checked === checked) {
      return;
    }
    item.checked = checked;
    if (checked) {
      state.checkedKeys.push(item.key);
      state.checkedItems.push(item);
    } else {
      const index = state.checkedKeys.indexOf(item.key);
      if (index > -1) {
        state.checkedKeys.splice(index, 1);
        state.checkedItems.splice(index, 1);
      }
    }
  };

  const $$updateCheckedByLastCheckedKeys = (
    lastCheckedKeys: string[],
    lastCheckedItems: OioListItem[],
    items: OioListItem[],
    checked: boolean
  ) => {
    const nextState: State = { checkedKeys: [...initState.checkedKeys], checkedItems: [...initState.checkedItems] };
    for (const item of items) {
      $$updateChecked(nextState, item, checked);
    }
    const searchStorage = { ...initState.storage };
    const submitCheckedKeys = [...lastCheckedKeys];
    const submitCheckedItems = [...lastCheckedItems];
    for (let i = 0; i < nextState.checkedKeys.length; i++) {
      const checkedKey = nextState.checkedKeys[i];
      if (lastCheckedKeys.indexOf(checkedKey) === -1) {
        submitCheckedKeys.push(checkedKey);
        submitCheckedItems.push(nextState.checkedItems[i]);
      }
      delete searchStorage[checkedKey];
    }
    for (const key of Object.keys(searchStorage)) {
      const index = submitCheckedKeys.indexOf(key);
      if (index > -1) {
        submitCheckedKeys.splice(index, 1);
        submitCheckedItems.splice(index, 1);
      }
    }
    initState.submitCheckedKeys = submitCheckedKeys;
    initState.submitCheckedItems = submitCheckedItems;
  };

  const onCheckedAll = (items: OioListItem[], checked: boolean) => {
    const { lastCheckedKeys, lastCheckedItems } = initState;
    if (lastCheckedKeys && lastCheckedItems) {
      $$updateCheckedByLastCheckedKeys(lastCheckedKeys, lastCheckedItems, items, checked);
      return;
    }
    const isDiff = options?.isDiff?.();
    if (isDiff) {
      $$diffCheckedAll(initState, items, checked);
      initState.checkedKeys = [...initState.checkedKeys];
      return;
    }
    $$checkedAll(initState, items, checked);
  };

  const $$diffCheckedAll = (state: State, items: OioListItem[], checked: boolean) => {
    if (checked) {
      const nextState: State = { checkedKeys: [], checkedItems: [] };
      $$updateCheckedAll(items, nextState);
      for (let i = 0; i < nextState.checkedKeys.length; i++) {
        const checkedKey = nextState.checkedKeys[i];
        if (state.checkedKeys.indexOf(checkedKey) <= -1) {
          state.checkedKeys.push(checkedKey);
          state.checkedItems.push(nextState.checkedItems[i]);
        }
      }
    } else {
      const uncheckedKeys: string[] = [];
      $$updateUncheckedAll(items, uncheckedKeys);
      for (const checkedKey of uncheckedKeys) {
        const index = state.checkedKeys.indexOf(checkedKey);
        if (index !== -1) {
          state.checkedKeys.splice(index, 1);
          state.checkedItems.splice(index, 1);
        }
      }
    }
  };

  const $$checkedAll = (state: State, items: OioListItem[], checked: boolean) => {
    if (checked) {
      const nextState: State = { checkedKeys: [], checkedItems: [] };
      $$updateCheckedAll(items, nextState);
      state.checkedKeys = nextState.checkedKeys;
      state.checkedItems = nextState.checkedItems;
    } else {
      $$updateUncheckedAll(items);
      state.checkedKeys = [];
      state.checkedItems = [];
    }
  };

  const $$updateCheckedAll = (items: OioListItem[], nextState: State) => {
    for (const item of items) {
      nextState.checkedKeys.push(item.key);
      nextState.checkedItems.push(item);
      item.checked = true;
    }
  };

  const $$updateUncheckedAll = (items: OioListItem[], uncheckedKeys?: string[]) => {
    for (const item of items) {
      uncheckedKeys?.push(item.key);
      item.checked = false;
    }
  };

  const onRefreshCheckedState = (items: OioListItem[], checkedKeys: string[]) => {
    const nextState: State = { checkedKeys: [], checkedItems: [] };
    $$refreshCheckedState(items, checkedKeys, nextState);
    initState.checkedKeys = nextState.checkedKeys;
    initState.checkedItems = nextState.checkedItems;
  };

  const $$refreshCheckedState = (items: OioListItem[], checkedKeys: string[], newState: State) => {
    for (const item of items) {
      const checked = checkedKeys.includes(item.key);
      item.checked = checked;
      if (checked) {
        newState.checkedKeys.push(item.key);
        newState.checkedItems.push(item);
      }
    }
  };

  return {
    onChecked,
    $$updateChecked,
    onCheckedAll,
    onRefreshCheckedState
  };
}

function useSingleListChecked(initState: State) {
  const onChecked = (item: OioListItem, checked: boolean) => {
    $$updateChecked(initState, item, checked);
  };

  const $$updateChecked = (state: State, item: OioListItem, checked: boolean) => {
    if (item.key === state.checkedKeys[0]) {
      return;
    }
    if (checked) {
      state.checkedKeys = [item.key];
      state.checkedItems = [item];
    }
  };

  const onCheckedAll = (items: OioListItem[], checked: boolean) => {
    console.error('this method is unsupported. cause: mode is single.');
  };

  const onRefreshCheckedState = (items: OioListItem[], checkedKeys: string[]) => {
    const nextState: State = { checkedKeys: [], checkedItems: [] };
    $$refreshCheckedState(items, checkedKeys?.[0], nextState);
    initState.checkedKeys = nextState.checkedKeys;
    initState.checkedItems = nextState.checkedItems;
  };

  const $$refreshCheckedState = (items: OioListItem[], checkedKey: string, newState: State) => {
    for (const item of items) {
      const checked = item.key === checkedKey;
      item.checked = checked;
      if (checked) {
        newState.checkedKeys.push(item.key);
        newState.checkedItems.push(item);
        return;
      }
    }
  };

  return {
    onChecked,
    $$updateChecked,
    onCheckedAll,
    onRefreshCheckedState
  };
}
