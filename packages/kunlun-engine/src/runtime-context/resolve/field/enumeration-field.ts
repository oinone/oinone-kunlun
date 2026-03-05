import type { EnumerationOptionDslDefinition, FieldDslDefinition } from '@oinone/kunlun-dsl';
import { toString } from 'lodash-es';
import type { RuntimeEnumerationField, RuntimeEnumerationOption } from '../../../runtime-metadata';
import type { RuntimeContext } from '../../runtime-context';

export function convertEnumerationField(
  runtimeContext: RuntimeContext,
  dsl: FieldDslDefinition,
  field: RuntimeEnumerationField
) {
  if (dsl.options) {
    const options: RuntimeEnumerationOption[] = [];
    (dsl.options as EnumerationOptionDslDefinition[])?.forEach((option) => {
      const target = dslOptionToEnumerationOption(option);
      if (target == null) {
        return;
      }
      options.push(target);
    });
    field.options = options;
  } else if (dsl.dictionary) {
    field.options = runtimeContext.dataDictionaryMap?.[dsl.dictionary] || [];
  }
}

export function dslOptionToEnumerationOption(
  option: EnumerationOptionDslDefinition
): RuntimeEnumerationOption | undefined {
  const {
    name,
    value,
    label,
    displayName,
    hint,
    help,
    summary,
    thumbnail,
    invisible,
    disabled,
    isDefault,
    color,
    backgroundColor,
    borderColor,
    icon,
    state
  } = option;
  if (name == null) {
    return undefined;
  }
  return {
    name: toString(name),
    value,
    displayName: label || displayName,
    label: label || displayName,
    hint,
    thumbnail,
    state,
    help: help ?? summary,

    invisible,
    disabled,
    isDefault,

    color,
    backgroundColor,
    borderColor,
    icon
  };
}
