<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import {
  CastHelper,
  OioBaseContainerProps,
  OioCollapse,
  OioCollapseExpandIconPosition,
  OioCollapseInstance,
  OioCollapseMethod,
  OioCollapseType,
  PropRecordHelper,
  StringHelper
} from '@oinone/kunlun-vue-ui-antd';
import { createVNode, defineComponent, onMounted, PropType, ref } from 'vue';

export default defineComponent({
  name: 'DefaultCollapse',
  components: {
    OioCollapse
  },
  props: {
    ...OioBaseContainerProps,
    template: {
      type: Object as PropType<DslDefinition>
    },
    activeKey: {
      type: [String, Array] as PropType<string | string[]>
    },
    onActiveKeyChange: {
      type: Function as PropType<(key: string | string[]) => void>
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
      if (props.expandAll && !props.accordion) {
        const panelKeys = origin.value?.getPanelKeys();
        if (panelKeys) {
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
        ...PropRecordHelper.collectionBasicProps(
          this.$attrs,
          StringHelper.append(['oio-default-collapse'], CastHelper.cast(this.template?.class)),
          CastHelper.cast(this.template?.style)
        ),
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
