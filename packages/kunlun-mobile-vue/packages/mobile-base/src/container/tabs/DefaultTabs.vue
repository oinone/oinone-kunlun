<script lang="ts">
import {
  FormLayout,
  OioTabPosition,
  OioTabs,
  PropRecordHelper,
  useInjectOioFormContext,
  useProviderOioFormContext,
  DEFAULT_PREFIX
} from '@kunlun/vue-ui-mobile-vant';
import { computed, createVNode, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'DefaultTabs',
  components: {
    OioTabs
  },
  inheritAttrs: false,
  props: {
    currentHandle: {
      type: String
    },
    invisible: {
      type: Boolean,
      default: false
    },
    activeKey: {
      type: String
    },
    onActiveKeyChange: {
      type: Function as PropType<(tabKey: string) => void>
    },
    tabPosition: {
      type: String as PropType<OioTabPosition>,
      default: OioTabPosition.TOP
    },
    layout: {
      type: [String, Object] as PropType<FormLayout>
    }
  },
  setup(props) {
    const formContext = useInjectOioFormContext();

    const layout = computed(() => {
      return props.layout || formContext.layout.value;
    });

    const onUpdateActiveKey = (val: string) => {
      props.onActiveKeyChange?.(val);
    };

    useProviderOioFormContext({
      ...formContext,
      layout
    });

    return {
      onUpdateActiveKey
    };
  },
  render() {
    return createVNode(
      OioTabs,
      {
        class: `${DEFAULT_PREFIX}-default-tabs`,
        activeKey: this.activeKey,
        tabPosition: this.tabPosition,
        verticalHeight: 264,
        invisible: this.invisible,
        lazyRender: false,
        onChange: this.onUpdateActiveKey
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        {
          origin: 'default',
          isNotNull: true
        }
      ])
    );
  }
});
</script>
