import { hasActionBarViewState, hasRowActionBarViewState, OioActionBarState, OioAnyViewState } from '../typing';

export function defineActionBarStateProperty(this: OioActionBarState, rowIndex?: number) {
  Object.defineProperty(this, 'actionBarState', {
    get() {
      if (rowIndex == null) {
        if (hasActionBarViewState(this)) {
          return this.actionBar;
        }
      } else if (hasRowActionBarViewState(this)) {
        return this.rowActions?.[rowIndex];
      }
    }
  });
}

export function pushAction(this: OioAnyViewState, handle: string) {
  const actions = this.actionBarState?.actions;
  if (!actions) {
    return;
  }
  if (!actions.some((v) => v === handle)) {
    actions.push(handle);
    this.actionBarState!.actions = [...actions];
  }
}

export function popAction(this: OioAnyViewState, handle: string) {
  const actions = this.actionBarState?.actions;
  if (!actions) {
    return;
  }
  const index = actions.findIndex((v) => v === handle);
  if (index !== -1) {
    actions.splice(index, 1);
    this.actionBarState!.actions = [...actions];
  }
}
