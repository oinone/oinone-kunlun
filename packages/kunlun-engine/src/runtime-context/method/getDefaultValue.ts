import { cloneDeep } from 'lodash-es';
import { isRelation2OField } from '../helper';
import { RuntimeContext } from '../runtime-context';
import { seekFieldRuntimeContext } from './util';

export default async function getDefaultValue(this: RuntimeContext): Promise<Record<string, unknown>> {
  let defaultValue = this.defaultValueCache;
  if (!defaultValue) {
    defaultValue = await getDefaultValueInternal.bind(this)();
    this.defaultValueCache = defaultValue;
  }
  return cloneDeep(defaultValue);
}

async function getDefaultValueInternal(this: RuntimeContext): Promise<Record<string, unknown>> {
  const defaultValue: Record<string, unknown> = {};
  await Promise.allSettled(
    this.model?.modelFields.map(async (field) => {
      if (isRelation2OField(field)) {
        const fieldRuntimeContext = seekFieldRuntimeContext(this, field);
        if (fieldRuntimeContext) {
          const childDefaultValue = await getDefaultValue.bind(fieldRuntimeContext)();
          if (Object.keys(childDefaultValue).length) {
            defaultValue[field.data] = childDefaultValue;
          }
        }
      } else {
        let { defaultValue: fieldDefaultValue } = field;
        if (fieldDefaultValue !== undefined) {
          if (Array.isArray(fieldDefaultValue)) {
            fieldDefaultValue = cloneDeep(fieldDefaultValue);
          }
          defaultValue[field.data] = fieldDefaultValue;
        }
      }
    })
  );
  return defaultValue;
}
