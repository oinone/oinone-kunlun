<script lang="ts">
import { CastHelper, type CSSStyle } from '@oinone/kunlun-shared';
import { FlexDirection, FormLayout, OioRow, OioRowProps, PropRecordHelper, useOioFormLayoutContext } from '@oinone/kunlun-vue-ui-antd';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, type PropType, vShow, withDirectives } from 'vue';
import { useProviderOioDefaultRowContext } from './context';

export default defineComponent({
  name: 'DefaultRow',
  components: {
    OioRow
  },
  inheritAttrs: false,
  props: {
    ...OioRowProps,
    invisible: {
      type: Boolean,
      default: false
    },
    allMounted: {
      type: Function
    },
    layout: {
      type: [String, Object] as PropType<FormLayout>
    },
    flexDirection: {
      type: String as PropType<FlexDirection>
    }
  },
  setup(props) {
    onAllMounted({
      allMounted: () => {
        props.allMounted?.();
      },
      allMountedUpdate: () => {
        props.allMounted?.();
      }
    });

    useOioFormLayoutContext(props);

    useProviderOioDefaultRowContext({
      flexDirection: computed(() => props.flexDirection || FlexDirection.Row),
      wrap: computed(() => props.wrap)
    });

    return {};
  },
  render() {
    const { $attrs, $slots, invisible, flexDirection } = this;
    const style = {} as CSSStyle;
    if (!style.flexDirection && flexDirection) {
      style.flexDirection = flexDirection;
    }
    return withDirectives(
      createVNode(
        OioRow,
        {
          ...PropRecordHelper.convert(OioRowProps, CastHelper.cast(this)),
          ...PropRecordHelper.collectionBasicProps($attrs, ['default-row'], style)
        },
        PropRecordHelper.collectionSlots($slots, [{ origin: 'default', isNotNull: true }])
      ),
      [[vShow, !invisible]]
    );
  }
});
</script>
