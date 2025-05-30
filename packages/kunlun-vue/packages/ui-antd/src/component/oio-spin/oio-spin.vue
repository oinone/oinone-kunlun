<script lang="ts">
import { NumberHelper, StringHelper } from '@kunlun/shared';
import { OioSpinProps, PropRecordHelper, SpinSize, StableSlotProp, StyleHelper } from '@kunlun/vue-ui-common';
import { Spin as ASpin } from 'ant-design-vue';
import { isNil, isString } from 'lodash-es';
import { computed, createVNode, defineComponent, PropType, Slot } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioSpin',
  components: {
    ASpin
  },
  inheritAttrs: false,
  props: {
    ...OioSpinProps,
    size: {
      type: [String, Number] as PropType<SpinSize | keyof typeof SpinSize | number>
    },
    delay: {
      type: Number
    },
    tip: {
      type: String as PropType<string> | Slot
    }
  },
  slots: ['default', 'tip'],
  setup(props) {
    const loading = computed<boolean>(() => {
      if (isNil(props.loading)) {
        return true;
      }
      return props.loading;
    });

    const size = computed<string>(() => {
      const size = props.size;
      const numberSize = NumberHelper.toNumber(size);
      if (!isNil(numberSize)) {
        return StyleHelper.px(numberSize) || SpinSize.default;
      }
      if (isString(size)) {
        return size;
      }
      return SpinSize.default;
    });

    const isInternalSize = computed<boolean>(() => {
      return [SpinSize.small, SpinSize.large].includes(size.value as SpinSize);
    });

    return {
      loading,
      size,
      isInternalSize
    };
  },
  render() {
    const classNames = [`${DEFAULT_PREFIX}-spin`];

    if (this.isInternalSize) {
      classNames.push(`${DEFAULT_PREFIX}-spin-${this.size}`);
    }

    let { loadingIndicator } = this;
    if (!loadingIndicator) {
      loadingIndicator = createVNode('span', { class: `${DEFAULT_PREFIX}-spin-loading` });
    }

    return createVNode(
      ASpin,
      {
        spinning: this.loading,
        indicator: loadingIndicator,
        wrapperClassName: StringHelper.append([`${DEFAULT_PREFIX}-spin-wrapper`], this.wrapperClassName).join(' '),
        delay: this.delay,
        tip: this.tip,
        ...PropRecordHelper.collectionBasicProps(this.$attrs, classNames)
      },
      {
        ...PropRecordHelper.collectionSlots(this.$slots, ['default', 'tip']),
        ...StableSlotProp
      }
    );
  }
});
</script>
