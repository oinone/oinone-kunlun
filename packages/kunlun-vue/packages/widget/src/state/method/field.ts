import { hasFieldsViewState, isGalleryViewState, OioAnyViewState } from '../typing';

function getFieldsState(viewState: OioAnyViewState, rowIndex?: number): { fields?: string[] } | undefined {
  if (rowIndex == null) {
    if (hasFieldsViewState(viewState)) {
      return viewState;
    }
  } else if (isGalleryViewState(viewState)) {
    return viewState.cards?.[rowIndex];
  }
}

export function pushField(this: OioAnyViewState, handle: string, rowIndex?: number): void {
  const fieldsState = getFieldsState(this, rowIndex);
  if (!fieldsState) {
    return;
  }
  const { fields } = fieldsState;
  if (!fields) {
    return;
  }
  if (!fields.some((v) => v === handle)) {
    fields.push(handle);
    fieldsState.fields = [...fields];
  }
}

export function popField(this: OioAnyViewState, handle: string, rowIndex?: number): void {
  const fieldsState = getFieldsState(this, rowIndex);
  if (!fieldsState) {
    return;
  }
  const { fields } = fieldsState;
  if (!fields) {
    return;
  }
  const index = fields.findIndex((v) => v === handle);
  if (index !== -1) {
    fields.splice(index, 1);
    fieldsState.fields = [...fields];
  }
}
