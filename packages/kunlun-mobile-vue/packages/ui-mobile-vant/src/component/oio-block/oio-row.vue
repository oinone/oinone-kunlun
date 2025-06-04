<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { OioRowProps, PropRecordHelper, RowProps } from '@oinone/kunlun-vue-ui-common';
import { Row as VanRow } from 'vant';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioRow',
  components: {
    VanRow
  },
  inheritAttrs: false,
  props: {
    ...OioRowProps
  },
  render() {
    return createVNode(
      VanRow,
      {
        ...PropRecordHelper.convert(RowProps, CastHelper.cast(this)),
        ...this.$attrs,
        // FIXME
        gutter: Array.isArray(this.gutter) ? this.gutter[0] : this.gutter,
        class: StringHelper.append([`${DEFAULT_PREFIX}-row`], CastHelper.cast(this.$attrs.class))
      },
      PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }])
    );
  }
});
</script>
