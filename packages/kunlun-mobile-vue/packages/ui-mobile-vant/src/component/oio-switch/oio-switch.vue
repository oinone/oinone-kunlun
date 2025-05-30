<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import { ASwitchProps, OioSwitchProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { Switch as VanSwitch } from 'vant';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioSwitch',
  components: {
    VanSwitch
  },
  inheritAttrs: false,
  props: {
    ...OioSwitchProps
  },
  slots: ['checkedChildren', 'unCheckedChildren'],
  emits: ['update:checked', 'change'],
  render() {
    return createVNode(
      VanSwitch,
      {
        ...PropRecordHelper.convert(ASwitchProps, CastHelper.cast(this)),
        ...this.$attrs,
        size: '18',
        modelValue: this.checked,
        'onUpdate:modelValue': (val) => this.$emit('update:checked', val),
        onChange: (val) => this.$emit('change', val),
        class: StringHelper.append([`${DEFAULT_PREFIX}-switch`], CastHelper.cast(this.$attrs.class))
      },
      PropRecordHelper.collectionSlots(this.$slots, ['checkedChildren', 'unCheckedChildren'])
    );
  }
});
</script>
