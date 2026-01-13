<script lang="ts">
import type { DslDefinition } from '@oinone/kunlun-dsl';
import {
  FormLayout,
  OioSpin,
  OioSpinProps,
  PropRecordHelper,
  SpinSize,
  useInjectOioFormContext,
  useProviderOioFormContext
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, type PropType, type Slot, vShow, withDirectives } from 'vue';
import { defaultFlexResolve } from '../../tags/resolve/helper';

export default defineComponent({
  name: 'DefaultSpin',
  components: {
    OioSpin
  },
  inheritAttrs: false,
  props: {
    template: {
      type: Object as PropType<DslDefinition>
    },
    ...OioSpinProps,
    size: {
      type: [String, Number] as PropType<SpinSize | keyof typeof SpinSize | number>
    },
    delay: {
      type: Number
    },
    tip: {
      type: String as PropType<string> | Slot
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

    return {};
  },
  render() {
    const { $attrs, $slots, template, loading, loadingIndicator, wrapperClassName, size, delay, tip, invisible } = this;
    const { default: defaultSlot } = PropRecordHelper.collectionSlots($slots, [
      {
        origin: 'default',
        isNotNull: true
      }
    ]);
    const defaultChildren = defaultFlexResolve(template, defaultSlot);
    const children: Record<string, Slot> = {
      default: () => defaultChildren
    };
    return withDirectives(
      createVNode(
        OioSpin,
        {
          ...PropRecordHelper.collectionBasicProps($attrs, ['oio-default-spin']),
          loading,
          loadingIndicator,
          wrapperClassName,
          size,
          delay,
          tip
        },
        children
      ),
      [[vShow, !invisible]]
    );
  }
});
</script>
