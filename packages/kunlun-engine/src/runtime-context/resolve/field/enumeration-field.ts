import { FieldDslDefinition } from '@kunlun/dsl';
import { toString } from 'lodash-es';
import { EnumOptionState } from '@kunlun/meta';
import { RuntimeEnumerationField, RuntimeEnumerationOption } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

interface DslOption {
  name: string;
  value: string;
  label: string;
  displayName: string;
  hint: string;
  thumbnail: string;
  state: EnumOptionState;

  invisible: boolean | string;
  disabled: boolean | string;
  isDefault: boolean;

  color: string;
  backgroundColor: string;
  borderColor: string;
  icon: string;
}

export function convertEnumerationField(
  runtimeContext: RuntimeContext,
  dsl: FieldDslDefinition,
  field: RuntimeEnumerationField
) {
  const options: RuntimeEnumerationOption[] = [];
  (dsl.options as DslOption[])?.forEach((option) => {
    const {
      name,
      value,
      label,
      displayName,
      hint,
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
      return;
    }
    options.push({
      name: toString(name),
      value,
      displayName: label || displayName,
      label: label || displayName,
      hint,
      thumbnail,
      state,

      invisible,
      disabled,
      isDefault,

      color,
      backgroundColor,
      borderColor,
      icon
    });
  });
  field.options = options;
}
