<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import { OioBreadcrumbItemProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { BreadcrumbItem as ABreadcrumbItem } from 'ant-design-vue';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioBreadcrumbItem',
  components: {
    ABreadcrumbItem
  },
  inheritAttrs: false,
  props: {
    ...OioBreadcrumbItemProps
  },
  slots: ['default', 'separator', 'overlay'],
  render() {
    return createVNode(
      ABreadcrumbItem,
      {
        ...PropRecordHelper.convert(OioBreadcrumbItemProps, CastHelper.cast(this)),
        ...this.$attrs,
        class: StringHelper.append([`${DEFAULT_PREFIX}-breadcrumb-item`], CastHelper.cast(this.$attrs.class))
      },
      PropRecordHelper.collectionSlots(this.$slots, ['default', 'separator', 'overlay'])
    );
  }
});
</script>
