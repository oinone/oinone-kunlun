import { isRelationField } from '../runtime-context/helper/field';
import { RuntimeModelField } from '../runtime-metadata';

export function isAllowSortable(field: RuntimeModelField) {
  const { store } = field;
  if (isRelationField(field)) {
    const { relationFields, referenceFields } = field;
    if (store) {
      return false;
    }
    return !!relationFields.length && !!referenceFields.length;
  }
  return store;
}

export function isAllowGrouping(field: RuntimeModelField) {
  return isAllowSortable(field);
}
