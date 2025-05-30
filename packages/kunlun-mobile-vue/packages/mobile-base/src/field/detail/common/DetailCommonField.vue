<script lang="ts">
import { OioEmpty, PropRecordHelper } from '@kunlun/vue-ui-common';
import { isBoolean, isFunction, isNil, isArray, toString } from 'lodash-es';
import { computed, createVNode, defineComponent, PropType } from 'vue';
import { DEFAULT_PREFIX } from '../../../ui/theme';

export default defineComponent({
  name: 'DetailCommonField',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Boolean, Object],
      default: undefined
    },
    isEmpty: {
      type: [Boolean, Function] as PropType<boolean | ((realValue) => boolean)>,
      default: undefined
    },
    emptyStyle: {
      type: String
    }
  },
  slots: ['default', 'empty'],
  setup(props) {
    const realValue = computed<string>(() => {
      const value = props.value;
      if (isNil(value)) {
        return '';
      }
      return toString(value);
    });

    const isRealEmpty = computed<boolean>(() => {
      const isEmptyValue = props.isEmpty;
      if (isBoolean(isEmptyValue)) {
        return isEmptyValue;
      }
      if (isFunction(isEmptyValue)) {
        return isEmptyValue(realValue.value);
      }
      if (props.value === '') {
        return true;
      }
      if (isArray(props.value) && props.value.length <= 0) {
        return true;
      }
      return isNil(props.value);
    });

    return {
      realValue,
      isRealEmpty
    };
  },
  render() {
    const { $attrs, $slots, isRealEmpty, emptyStyle } = this;
    const slots = PropRecordHelper.collectionSlots($slots, [
      {
        origin: 'default',
        default: ({ realValue }) => {
          return [
            createVNode(
              'div',
              {
                class: `${DEFAULT_PREFIX}-detail-common-field-value`,
                title: realValue
              },
              realValue
            )
          ];
        }
      },
      {
        origin: 'empty',
        default: () => [createVNode(OioEmpty, { emptyStyle })]
      }
    ]);
    const children = isRealEmpty ? slots.empty() : slots.default({ realValue: this.realValue });
    return createVNode('div', PropRecordHelper.collectionBasicProps($attrs, [`${DEFAULT_PREFIX}-detail-common-field`]), children);
  }
});
</script>
