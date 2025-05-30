<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import { OioBreadcrumbProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { Breadcrumb as ABreadcrumb } from 'ant-design-vue';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioBreadcrumb',
  components: {
    ABreadcrumb
  },
  inheritAttrs: false,
  props: {
    ...OioBreadcrumbProps
  },
  slots: ['default', 'separator', 'itemRender'],
  render() {
    return createVNode(
      ABreadcrumb,
      {
        ...PropRecordHelper.convert(OioBreadcrumbProps, CastHelper.cast(this)),
        ...this.$attrs,
        class: StringHelper.append([`${DEFAULT_PREFIX}-breadcrumb`], CastHelper.cast(this.$attrs.class))
      },
      PropRecordHelper.collectionSlots(this.$slots, ['default', 'separator', 'itemRender'])
    );
  }
});
</script>
