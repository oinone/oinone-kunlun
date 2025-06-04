<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { OioDividerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { Divider as ADivider } from 'ant-design-vue';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioDivider',
  components: {
    ADivider
  },
  inheritAttrs: false,
  props: {
    ...OioDividerProps
  },
  slots: ['default'],
  render() {
    return createVNode(
      ADivider,
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
