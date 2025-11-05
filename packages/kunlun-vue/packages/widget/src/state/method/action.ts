import { Widget } from '../../basic';
import { executeInvisible, InvisibleSupported } from '../../feature';
import { hasActionBarViewState, hasRowActionBarViewState, OioActionBarState, OioAnyViewState } from '../typing';

export function createActionBarState(
  this: OioAnyViewState,
  options: {
    handle: string;
  } & Partial<Omit<OioActionBarState, 'handle'>>
) {
  const state: OioActionBarState = {
    actions: [],
    visibleActions: [],
    ...options
  };
  Object.defineProperty(state, 'visibleActions', {
    get() {
      return this.actions.filter((handle: string) => {
        const widget = Widget.select<Widget & InvisibleSupported>(handle);
        if (!widget) {
          return false;
        }
        return !executeInvisible(widget);
      });
    }
  });
  return state;
}

export function getActionBarState(this: OioAnyViewState, rowIndex?: number): OioActionBarState | undefined {
  if (rowIndex == null) {
    if (hasActionBarViewState(this)) {
      return this.actionBar;
    }
  } else if (hasRowActionBarViewState(this)) {
    return this.inlineActionBars?.[rowIndex];
  }
}

export function pushAction(this: OioAnyViewState, handle: string, rowIndex?: number) {
  const actionBarState = this.getActionBarState(rowIndex);
  if (!actionBarState) {
    return;
  }
  const { actions } = actionBarState;
  if (!actions) {
    return;
  }
  if (!actions.some((v) => v === handle)) {
    actions.push(handle);
    actionBarState.actions = [...actions];
  }
}

export function popAction(this: OioAnyViewState, handle: string, rowIndex?: number) {
  const actionBarState = this.getActionBarState(rowIndex);
  if (!actionBarState) {
    return;
  }
  const { actions } = actionBarState;
  if (!actions) {
    return;
  }
  const index = actions.findIndex((v) => v === handle);
  if (index !== -1) {
    actions.splice(index, 1);
    actionBarState.actions = [...actions];
  }
}
