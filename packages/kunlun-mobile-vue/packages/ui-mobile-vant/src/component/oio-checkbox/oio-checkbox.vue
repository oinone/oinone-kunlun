<script lang="ts">
import { OioCheckboxProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { Checkbox as VanCheckbox } from 'vant';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioCheckbox',
  components: {
    VanCheckbox
  },
  inheritAttrs: false,
  props: {
    ...OioCheckboxProps
  },
  emits: ['update:checked', 'change'],
  slots: ['default'],
  render() {
    return createVNode(
      VanCheckbox,
      {
        // autofocus: this.autofocus,
        // indeterminate: this.indeterminate,
        modelValue: this.checked,
        disabled: this.disabled,
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-checkbox`]),
        'onUpdate:modelValue': (val) => this.$emit('update:checked', val),
        onChange: (val) => this.$emit('change', val)
      },
      PropRecordHelper.collectionSlots(this.$slots, ['default'])
    );
  }
});
</script>
