import { hasActionBarViewState, hasRowActionBarViewState, OioActionBarState, OioAnyViewState } from '../typing';

export function defineActionBarStateProperty(this: OioActionBarState) {
  Object.defineProperty(this, 'actionBarState', {
    get() {
      if (hasActionBarViewState(this)) {
        return this.actionBar;
      }
    }
  });
}

function getActionBarState(viewState: OioAnyViewState, rowIndex?: number): OioActionBarState | undefined {
  if (rowIndex == null) {
    if (hasActionBarViewState(viewState)) {
      return viewState.actionBar;
    }
  } else if (hasRowActionBarViewState(viewState)) {
    return viewState.inlineActionBars?.[rowIndex];
  }
}

export function pushAction(this: OioAnyViewState, handle: string, rowIndex?: number) {
  const actionBarState = getActionBarState(this, rowIndex);
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
  const actionBarState = getActionBarState(this, rowIndex);
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
