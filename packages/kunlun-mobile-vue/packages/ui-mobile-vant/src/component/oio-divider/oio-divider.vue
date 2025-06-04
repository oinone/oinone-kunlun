<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { OioDividerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { Divider as VanDivider } from 'vant';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioDivider',
  components: {
    VanDivider
  },
  inheritAttrs: false,
  props: {
    ...OioDividerProps
  },
  slots: ['default'],
  render() {
    return createVNode(
      VanDivider,
      {
        ...PropRecordHelper.convert(OioDividerProps, CastHelper.cast(this)),
        ...this.$attrs,
        class: StringHelper.append([`${DEFAULT_PREFIX}-divider`], CastHelper.cast(this.$attrs.class)),
        style: this.$attrs.style
      },
      PropRecordHelper.collectionSlots(this.$slots, ['default'])
    );
  }
});
</script>
