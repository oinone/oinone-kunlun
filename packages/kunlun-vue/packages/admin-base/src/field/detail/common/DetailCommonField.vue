<script lang="ts">
import { OioEmpty, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { isArray, isBoolean, isFunction, isNil, toString } from 'lodash-es';
import { computed, createVNode, defineComponent, type PropType } from 'vue';

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
    },
    wrapperToFieldAction: {
      type: Function
    }
  },
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
          let children = realValue;
          if (this.wrapperToFieldAction) {
            children = this.wrapperToFieldAction(realValue);
          }
          return [
            createVNode(
              'div',
              {
                class: 'detail-common-field-value',
                title: realValue,
                style: {
                  whiteSpace: 'pre-line'
                }
              },
              children
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
    return createVNode('div', PropRecordHelper.collectionBasicProps($attrs, ['detail-common-field']), children);
  }
});
</script>
