<script lang="ts">
import { CastHelper } from '@oinone/kunlun-shared';
import {
  FormLayout,
  OioBlock,
  OioBlockProps,
  PropRecordHelper,
  useOioFormLayoutContext
} from '@oinone/kunlun-vue-ui-antd';
import { createVNode, defineComponent, PropType, vShow, withDirectives } from 'vue';

export default defineComponent({
  name: 'DefaultBlock',
  components: {
    OioBlock
  },
  inheritAttrs: false,
  props: {
    ...OioBlockProps,
    layout: {
      type: [String, Object] as PropType<FormLayout>
    },
    invisible: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    useOioFormLayoutContext(props);

    return {};
  },
  render() {
    return withDirectives(
      createVNode(
        OioBlock,
        {
          ...PropRecordHelper.convert(OioBlockProps, CastHelper.cast(this)),
          ...PropRecordHelper.collectionBasicProps(this.$attrs)
        },
        PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }])
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
