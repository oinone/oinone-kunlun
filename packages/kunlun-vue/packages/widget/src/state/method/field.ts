import { OioAnyViewState } from '../typing';

export function pushField(this: OioAnyViewState, handle: string): void {
  const { fields } = this;
  if (!fields) {
    return;
  }
  if (!fields.some((v) => v === handle)) {
    fields.push(handle);
    this.fields = [...fields];
  }
}

export function popField(this: OioAnyViewState, handle: string): void {
  const { fields } = this;
  if (!fields) {
    return;
  }
  const index = fields.findIndex((v) => v === handle);
  if (index !== -1) {
    fields.splice(index, 1);
    this.fields = [...fields];
  }
}
