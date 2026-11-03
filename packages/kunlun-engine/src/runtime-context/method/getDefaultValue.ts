import { cloneDeep } from 'lodash-es';
import { isRelation2OField, isRelation2OValueEmpty } from '../helper';
import type { RuntimeContext } from '../runtime-context';
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
          // 仅保留带主键的关联默认对象，避免无主键默认值造成「假选中」。
          if (!isRelation2OValueEmpty(field, childDefaultValue)) {
            defaultValue[field.data] = childDefaultValue;
          }
        }
        return;
      }
      let { defaultValue: fieldDefaultValue } = field;
      if (fieldDefaultValue !== undefined) {
        if (Array.isArray(fieldDefaultValue)) {
          fieldDefaultValue = cloneDeep(fieldDefaultValue);
        }
        defaultValue[field.data] = fieldDefaultValue;
      }
    })
  );
  return defaultValue;
}
