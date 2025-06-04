<script lang="ts">
import {
  OioBaseContainerProps,
  OioTabAlign,
  OioTabPosition,
  OioTabs,
  PropRecordHelper
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'DefaultTabs',
  components: {
    OioTabs
  },
  inheritAttrs: false,
  props: {
    ...OioBaseContainerProps,
    currentHandle: {
      type: String
    },
    activeKey: {
      type: String
    },
    onActiveKeyChange: {
      type: Function as PropType<(key: string) => void>
    },
    tabPosition: {
      type: String as PropType<OioTabPosition>,
      default: OioTabPosition.TOP
    },
    tabAlign: {
      type: String as PropType<OioTabAlign>,
      default: OioTabAlign.LEFT
    }
  },
  setup(props) {
    const tabAlignClass = computed(() => {
      if ([OioTabPosition.TOP, OioTabPosition.BOTTOM].includes(props.tabPosition)) {
        return `oio-default-tabs-horizontal-${props.tabAlign}`;
      }
      return `oio-default-tabs-vertical-${props.tabAlign}`;
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
        class: ['oio-default-tabs', this.tabAlignClass],
        id: this.currentHandle,
        activeKey: this.activeKey,
        tabPosition: this.tabPosition,
        verticalHeight: 264,
        layout: this.layout,
        invisible: this.invisible,
        disabled: this.disabled,
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
