import { FormLayout, ValidateTrigger } from '@kunlun/vue-ui-common';
import { PropType } from 'vue';
import { ValidatorInfo } from '../../typing';

export const BaseFormItemProps = {
  name: {
    type: String
  },
  invisible: {
    type: Boolean
  },
  colon: {
    type: Boolean,
    default: false
  },
  layout: {
    type: [String, Object] as PropType<FormLayout>
  },
  label: {
    type: [String, Boolean],
    default: undefined
  },
  help: {
    type: String
  },
  hint: {
    type: String
  },
  required: {
    type: Boolean,
    default: undefined
  },
  validateTrigger: {
    type: [String, Array] as PropType<(string | ValidateTrigger) | (string | ValidateTrigger)[]>
  },
  validatorInfo: {
    type: Object as PropType<ValidatorInfo>
  }
};
