<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { OioColgroup, OioColgroupProps } from '@oinone/kunlun-vue-ui';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, createVNode, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'DefaultColgroupColumn',
  components: {
    OioColgroup
  },
  inheritAttrs: false,
  props: {
    ...OioColgroupProps,
    handle: {
      type: String
    },
    template: {
      type: Object as PropType<DslDefinition>
    },
    columnType: {
      type: String
    },
    existExpandRow: {
      type: Boolean
    }
  },
  setup(props) {
    const fixed = computed(() => {
      if (props.existExpandRow) {
        return undefined;
      }
      return props.fixed;
    });

    return {
      fixed
    };
  },
  render() {
    const {
      $slots,

      handle,
      template,
      columnType,
      label,
      align,
      headerAlign,
      footerAlign,
      width,
      minWidth,
      fixed,
      invisible,
      className,
      headerClassName
    } = this;
    return createVNode(
      OioColgroup,
      {
        type: columnType,
        label,
        align,
        headerAlign,
        footerAlign,
        width,
        minWidth,
        fixed,
        invisible,
        className,
        headerClassName,
        componentData: {
          params: {
            handle,
            template
          }
        }
      },
      PropRecordHelper.collectionSlots($slots, ['default'])
    );
  }
});
</script>
