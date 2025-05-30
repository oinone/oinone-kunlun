<script lang="ts">
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { PropRecordHelper } from '../../util';
import { EmptyStyle, OioEmptyProps } from './props';

export default defineComponent({
  name: 'OioEmpty',
  inheritAttrs: false,
  props: {
    ...OioEmptyProps
  },
  slots: ['default'],
  setup(props) {
    const emptyValue = computed(() => {
      const value = props.emptyStyle?.toLowerCase?.();
      if (value == null) {
        return EmptyStyle.hyphen;
      }
      const enumValue = EmptyStyle[value];
      if (enumValue != null) {
        return enumValue;
      }
      return value;
    });

    return {
      emptyValue
    };
  },
  render() {
    const { $attrs, $slots, emptyValue } = this;
    const { default: defaultSlot } = PropRecordHelper.collectionSlots($slots, ['default']);
    let children;
    if (defaultSlot) {
      children = defaultSlot();
    } else {
      children = this.$translate(emptyValue);
    }
    return createVNode('div', PropRecordHelper.collectionBasicProps($attrs, [`${DEFAULT_PREFIX}-empty`]), children);
  }
});
</script>
