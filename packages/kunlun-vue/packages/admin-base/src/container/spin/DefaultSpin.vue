<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import {
  FormLayout,
  OioGroup,
  OioSpin,
  OioSpinProps,
  PropRecordHelper,
  SpinSize,
  useInjectOioFormContext,
  useProviderOioFormContext
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType, Slot, vShow, withDirectives } from 'vue';
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
          ...PropRecordHelper.collectionBasicProps(
            $attrs,
            StringHelper.append(['oio-default-spin'], CastHelper.cast(template?.class)),
            CastHelper.cast(template?.style)
          ),
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
