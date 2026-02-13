<script lang="ts">
import {
  OioBaseContainerProps,
  OioCollapse,
  OioCollapseExpandIconPosition,
  OioCollapseInstance,
  OioCollapseMethod,
  OioCollapseType,
  PropRecordHelper
} from '@oinone/kunlun-vue-ui-antd';
import { createVNode, defineComponent, onMounted, type PropType, ref } from 'vue';

export default defineComponent({
  name: 'DefaultCollapse',
  components: {
    OioCollapse
  },
  props: {
    ...OioBaseContainerProps,
    activeKey: {
      type: [String, Array] as PropType<string | string[]>
    },
    onActiveKeyChange: {
      type: Function as PropType<(key: string | string[]) => void>
    },
    setAllKeys: {
      type: Function as PropType<(keys: string[]) => void>
    },
    type: {
      type: String as PropType<OioCollapseType | keyof typeof OioCollapseType>,
      default: OioCollapseType.bordered
    },
    collapseMethod: {
      type: String as PropType<OioCollapseMethod | keyof typeof OioCollapseMethod>,
      default: OioCollapseMethod.default
    },
    expandAll: {
      type: Boolean,
      default: true
    },
    accordion: {
      type: Boolean,
      default: false
    },
    expandIconPosition: {
      type: [String, Object] as PropType<OioCollapseExpandIconPosition>,
      default: OioCollapseExpandIconPosition.right
    }
  },
  setup(props) {
    const origin = ref<OioCollapseInstance>();

    const onUpdateActiveKey = (val: string | string[]) => {
      props.onActiveKeyChange?.(val);
    };

    onMounted(() => {
      const panelKeys = origin.value?.getPanelKeys();
      if (panelKeys) {
        props.setAllKeys?.(panelKeys);
        if (props.expandAll && !props.accordion) {
          onUpdateActiveKey(panelKeys);
        }
      }
    });

    return {
      origin,
      onUpdateActiveKey
    };
  },
  render() {
    return createVNode(
      OioCollapse,
      {
        ref: 'origin',
        ...PropRecordHelper.collectionBasicProps(this.$attrs, ['oio-default-collapse']),
        activeKey: this.activeKey,
        onActiveKeyChange: this.onActiveKeyChange,
        type: this.type,
        collapseMethod: this.collapseMethod,
        accordion: this.accordion,
        expandIconPosition: this.expandIconPosition,
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
