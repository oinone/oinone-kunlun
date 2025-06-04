import { FieldDslDefinition } from '@oinone/kunlun-dsl';
import toString from 'lodash/toString';
import { RuntimeModelField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

export function resolveDefaultValue(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeModelField) {
  const { defaultValue } = dsl;
  if (field.defaultValue !== undefined) {
    return;
  }
  if (isConvert(defaultValue)) {
    if (field.multi) {
      convertMultiStringDefaultValue(runtimeContext, field, defaultValue);
    } else {
      convertStringDefaultValue(runtimeContext, field, defaultValue);
    }
  }
}

function isConvert(defaultValue: string | boolean | null | undefined): defaultValue is string | boolean {
  if (defaultValue == null) {
    return false;
  }
  if (typeof defaultValue === 'string' && defaultValue === '') {
    return false;
  }
  return true;
}

function convertStringDefaultValue(
  runtimeContext: RuntimeContext,
  field: RuntimeModelField,
  defaultValue: string | boolean
) {
  field.defaultValue = defaultValue;
}

function convertMultiStringDefaultValue(
  runtimeContext: RuntimeContext,
  field: RuntimeModelField,
  defaultValue: string | boolean
) {
  field.defaultValue = toString(defaultValue)
    .split(',')
    .map((v) => v.trim());
}

export function resolveSearchDatetimeDefaultValue(
  runtimeContext: RuntimeContext,
  dsl: FieldDslDefinition,
  field: RuntimeModelField
) {
  const { startDefaultValue, endDefaultValue } = dsl;
  const fieldDefaultValue = field.defaultValue;
  if (fieldDefaultValue == null) {
    let startValue;
    let endValue;
    if (isConvert(startDefaultValue)) {
      startValue = startDefaultValue;
    }
    if (isConvert(endDefaultValue)) {
      endValue = endDefaultValue;
    }
    if (startValue || endValue) {
      field.defaultValue = [startValue, endValue];
    }
  }
}
