export function useCheckedAll(state: {
  checkedKeys: string[];
  count: number;
  checkedAll: boolean;
  halfCheckedAll: boolean;
}) {
  const updateCheckedAllState = () => {
    if (state.checkedKeys.length >= 1) {
      if (state.checkedKeys.length >= state.count) {
        state.checkedAll = true;
        state.halfCheckedAll = false;
      } else {
        state.checkedAll = false;
        state.halfCheckedAll = true;
      }
    } else {
      state.checkedAll = false;
      state.halfCheckedAll = false;
    }
  };

  return {
    updateCheckedAllState
  };
}
