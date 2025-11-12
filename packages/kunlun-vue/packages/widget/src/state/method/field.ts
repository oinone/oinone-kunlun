import { hasFieldsViewState, isGalleryViewState, OioAnyViewState } from '../typing';

interface FieldState {
  fields?: string[];
  fieldWidgets?: Record<string, string>;
}

function getFieldsState(viewState: OioAnyViewState, rowIndex?: number): FieldState | undefined {
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
  const { fields, fieldWidgets } = fieldsState;
  if (fields) {
    if (!fields.some((v) => v === handle)) {
      fields.push(handle);
      fieldsState.fields = [...fields];
    }
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
