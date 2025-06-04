<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import {
  FormLayout,
  OioBlock,
  OioBlockProps,
  PropRecordHelper,
  useInjectOioFormContext,
  useProviderOioFormContext
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { computed, createVNode, defineComponent, PropType, vShow, withDirectives } from 'vue';

export default defineComponent({
  name: 'DefaultBlock',
  components: {
    OioBlock
  },
  inheritAttrs: false,
  props: {
    ...OioBlockProps,
    template: {
      type: Object as PropType<DslDefinition>
    },
    layout: {
      type: [String, Object] as PropType<FormLayout>
    },
    invisible: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const formContext = useInjectOioFormContext();

    const layout = computed(() => {
      return props.layout || formContext.layout.value;
    });

    useProviderOioFormContext({
      ...formContext,
      layout
    });
  },
  render() {
    return withDirectives(
      createVNode(
        OioBlock,
        {
          ...PropRecordHelper.convert(OioBlockProps, CastHelper.cast(this)),
          ...PropRecordHelper.collectionBasicProps(
            this.$attrs,
            StringHelper.append([], CastHelper.cast(this.template?.class)),
            CastHelper.cast(this.template?.style)
          )
        },
        PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }])
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
