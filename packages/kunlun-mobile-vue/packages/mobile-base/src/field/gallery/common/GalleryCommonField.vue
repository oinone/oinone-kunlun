<script lang="ts">
import { CSSStyle, Optional } from '@oinone/kunlun-shared';
import { FlexRowJustify, OioEmpty, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { isArray, isBoolean, isFunction, isNil, toString } from 'lodash-es';
import { computed, createVNode, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'GalleryCommonField',
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
    justifyContent: {
      type: String as PropType<string | FlexRowJustify>
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

    const justifyContent = computed(() => {
      return Optional.ofNullable(props.justifyContent)
        .map((v) => FlexRowJustify[v!])
        .orElse(FlexRowJustify.START);
    });

    const style = computed<CSSStyle>(() => {
      const styleValue = {} as CSSStyle;
      if (justifyContent.value) {
        styleValue.justifyContent = justifyContent.value;
      }
      return styleValue;
    });

    return {
      realValue,
      isRealEmpty,
      justifyContent,
      style
    };
  },
  render() {
    const { $attrs, $slots, isRealEmpty, style, emptyStyle } = this;
    const { default: defaultSlot, empty: emptySlot } = PropRecordHelper.collectionSlots($slots, [
      {
        origin: 'default',
        default: ({ realValue }) => {
          return [
            createVNode(
              'div',
              {
                class: `gallery-common-field-value`,
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
    const children = isRealEmpty ? emptySlot() : defaultSlot({ realValue: this.realValue });
    return createVNode('div', PropRecordHelper.collectionBasicProps($attrs, [`gallery-common-field`], style), children);
  }
});
</script>
