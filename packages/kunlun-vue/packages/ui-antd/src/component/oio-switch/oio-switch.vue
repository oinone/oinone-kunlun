<script lang="ts">
import { OioSwitchProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { Switch as ASwitch } from 'ant-design-vue';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioSwitch',
  components: {
    ASwitch
  },
  inheritAttrs: false,
  props: {
    ...OioSwitchProps
  },
  slots: ['checkedChildren', 'uncheckedChildren'],
  emits: ['update:checked', 'change'],
  render() {
    return createVNode(
      ASwitch,
      {
        autofocus: this.autofocus,
        checked: this.checked,
        loading: this.loading,
        size: this.size,
        disabled: this.disabled,
        checkedValue: this.checkedValue,
        unCheckedValue: this.uncheckedValue,
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-switch`]),
        'onUpdate:checked': (val) => {
          this.$emit('update:checked', val);
        },
        onChange: (val) => this.$emit('change', val)
      },
      PropRecordHelper.collectionRenderSlots(this, [
        'checkedChildren',
        { origin: 'uncheckedChildren', target: 'unCheckedChildren' }
      ])
    );
  }
});
</script>
