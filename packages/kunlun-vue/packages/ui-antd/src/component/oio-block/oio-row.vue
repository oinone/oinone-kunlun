<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { FlexHelper, OioRowProps, PropRecordHelper, RowProps } from '@oinone/kunlun-vue-ui-common';
import { Row as ARow } from 'ant-design-vue';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioRow',
  components: {
    ARow
  },
  inheritAttrs: false,
  props: {
    ...OioRowProps
  },
  setup(props) {
    const gutter = computed(() => {
      const val = props.gutter;
      if (typeof val === 'string') {
        return FlexHelper.convertGutter(val);
      }
      return val;
    });

    return {
      gutter
    };
  },
  render() {
    return createVNode(
      ARow,
      {
        ...PropRecordHelper.convert(RowProps, CastHelper.cast(this)),
        ...this.$attrs,
        class: StringHelper.append([`${DEFAULT_PREFIX}-row`], CastHelper.cast(this.$attrs.class))
      },
      PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }])
    );
  }
});
</script>
