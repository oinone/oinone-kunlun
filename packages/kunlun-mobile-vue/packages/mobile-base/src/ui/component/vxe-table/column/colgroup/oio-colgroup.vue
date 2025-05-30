<script lang="ts">
import { PropRecordHelper } from '@kunlun/vue-ui-common';
import { computed, createVNode, defineComponent } from 'vue';
import { Colgroup as VxeColgroup } from 'vxe-table';
import { DEFAULT_PREFIX } from '../../../../theme';
import { ColumnAlignType } from '../typing';
import { OioColgroupProps } from './props';

const DEFAULT_CLASS_NAME = `${DEFAULT_PREFIX}-colgroup`;

export default defineComponent({
  name: 'OioColgroup',
  components: {
    VxeColgroup
  },
  inheritAttrs: false,
  props: {
    ...OioColgroupProps
  },
  setup(props) {
    const headerAlign = computed(() => {
      if (props.headerAlign == null) {
        return ColumnAlignType.center;
      }
      return props.headerAlign;
    });

    return {
      headerAlign
    };
  },
  render() {
    const {
      $attrs,
      $slots,

      label,
      align,
      headerAlign,
      width,
      minWidth,
      fixed,
      field,
      invisible,
      className,
      headerClassName,
      footerClassName,

      componentData
    } = this;

    return createVNode(
      VxeColgroup,
      {
        ...PropRecordHelper.collectionBasicProps($attrs, [DEFAULT_CLASS_NAME]),
        ...(componentData || {}),

        title: label,
        align,
        headerAlign,
        width,
        minWidth,
        fixed,
        field,
        visible: !invisible,
        className,
        headerClassName,
        footerClassName
      },
      $slots
    );
  }
});
</script>
