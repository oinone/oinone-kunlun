<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { CastHelper, CSSStyle, StringHelper } from '@oinone/kunlun-shared';
import {
  FlexDirection,
  FormLayout,
  OioRow,
  OioRowProps,
  PropRecordHelper,
  StyleHelper,
  useInjectOioFormContext,
  useProviderOioFormContext
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, PropType, vShow, withDirectives } from 'vue';
import { useProviderOioDefaultRowContext } from './context';

export default defineComponent({
  name: 'DefaultRow',
  components: {
    OioRow
  },
  inheritAttrs: false,
  props: {
    ...OioRowProps,
    template: {
      type: Object as PropType<DslDefinition>
    },
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

    const formContext = useInjectOioFormContext();

    const layout = computed(() => {
      return props.layout || formContext.layout.value;
    });

    useProviderOioFormContext({
      ...formContext,
      layout
    });

    useProviderOioDefaultRowContext({
      flexDirection: computed(() => props.flexDirection || FlexDirection.Row),
      wrap: computed(() => props.wrap)
    });

    return {};
  },
  render() {
    const { $attrs, $slots, template, invisible, flexDirection } = this;
    const style: CSSStyle = CastHelper.cast(StyleHelper.parse(template?.style) || {});
    if (!style.flexDirection && flexDirection) {
      style.flexDirection = flexDirection;
    }
    return withDirectives(
      createVNode(
        OioRow,
        {
          ...PropRecordHelper.convert(OioRowProps, CastHelper.cast(this)),
          ...PropRecordHelper.collectionBasicProps(
            $attrs,
            StringHelper.append([], CastHelper.cast(template?.class)),
            style
          )
        },
        PropRecordHelper.collectionSlots($slots, [{ origin: 'default', isNotNull: true }])
      ),
      [[vShow, !invisible]]
    );
  }
});
</script>
