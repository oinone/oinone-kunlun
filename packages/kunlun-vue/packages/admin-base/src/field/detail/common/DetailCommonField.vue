<script lang="ts">
import { OioEmpty, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { isBoolean, isFunction, isNil, isArray, toString } from 'lodash-es';
import { computed, createVNode, defineComponent, PropType } from 'vue';

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
    styleType: {
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

    const borderClassName = computed(() => {
      const names: string[] = [];
      if (props.styleType === 'border') {
        names.push('oio-detail-common-field-border');
      }

      return names.join(' ');
    });

    return {
      realValue,
      isRealEmpty,
      borderClassName
    };
  },
  render() {
    const { $attrs, $slots, isRealEmpty, emptyStyle, borderClassName } = this;
    const slots = PropRecordHelper.collectionSlots($slots, [
      {
        origin: 'default',
        default: ({ realValue }) => {
          return [
            createVNode(
              'div',
              {
                class: `${borderClassName} detail-common-field-value`,
                title: realValue,
                style: {
                  whiteSpace: 'pre-line'
                }
              },
              realValue
            )
          ];
        }
      },
      {
        origin: 'empty',
        default: () => [createVNode(OioEmpty, { emptyStyle, class: borderClassName })]
      }
    ]);
    const children = isRealEmpty ? slots.empty() : slots.default({ realValue: this.realValue });
    return createVNode('div', PropRecordHelper.collectionBasicProps($attrs, ['detail-common-field']), children);
  }
});
</script>
