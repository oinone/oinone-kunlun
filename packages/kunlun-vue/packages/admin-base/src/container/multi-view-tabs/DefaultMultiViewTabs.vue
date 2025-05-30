<script lang="ts">
import { DEFAULT_PREFIX } from '@kunlun/theme';
import {
  FormLayout,
  OioTabAlign,
  OioTabPosition,
  OioTabs,
  PropRecordHelper,
  useOioFormLayoutContext
} from '@kunlun/vue-ui-antd';
import { computed, createVNode, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'DefaultMultiViewTabs',
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
    tabAlign: {
      type: String as PropType<OioTabAlign>,
      default: OioTabAlign.LEFT
    },
    layout: {
      type: [String, Object] as PropType<FormLayout>
    }
  },
  setup(props) {
    useOioFormLayoutContext(props);

    const tabAlignClass = computed(() => {
      if ([OioTabPosition.TOP, OioTabPosition.BOTTOM].includes(props.tabPosition)) {
        return `${DEFAULT_PREFIX}-default-tabs-horizontal-${props.tabAlign}`;
      }
      return `${DEFAULT_PREFIX}-default-tabs-vertical-${props.tabAlign}`;
    });

    const onUpdateActiveKey = (val: string) => {
      props.onActiveKeyChange?.(val);
    };

    return {
      tabAlignClass,
      onUpdateActiveKey
    };
  },
  render() {
    return createVNode(
      OioTabs,
      {
        class: [`${DEFAULT_PREFIX}-default-tabs ${DEFAULT_PREFIX}-default-multi-view-tabs`, this.tabAlignClass],
        id: this.currentHandle,
        activeKey: this.activeKey,
        tabPosition: this.tabPosition,
        verticalHeight: 264,
        invisible: this.invisible,
        'onUpdate:activeKey': this.onUpdateActiveKey
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
