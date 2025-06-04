<script lang="ts">
import {
  OioCollapseExpandIconPosition,
  OioCollapseInstance,
  OioCollapseMethod,
  OioCollapseProps,
  OioCollapseType,
  PropRecordHelper,
  useOioFormLayoutContext,
  useProviderOioCollapseContext
} from '@oinone/kunlun-vue-ui-common';
import { Collapse as ACollapse } from 'ant-design-vue';
import { computed, createVNode, defineComponent, ref, vShow, withDirectives } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioCollapse',
  components: {
    ACollapse
  },
  inheritAttrs: false,
  props: {
    ...OioCollapseProps
  },
  slots: ['default'],
  emits: ['update:active-key'],
  setup(props, context) {
    useOioFormLayoutContext(props);

    const bordered = computed(() => {
      return props.type === OioCollapseType.bordered || props.type === OioCollapseType.stripe;
    });

    const ghost = computed(() => {
      return props.type === OioCollapseType.ghost;
    });

    const showArrow = computed(() => {
      return props.expandIconPosition !== OioCollapseExpandIconPosition.hidden;
    });

    const expandIconPosition = computed(() => {
      if (props.expandIconPosition === OioCollapseExpandIconPosition.hidden) {
        return undefined;
      }
      return props.expandIconPosition;
    });

    const collapsible = computed(() => {
      if (props.disabled) {
        return 'disabled';
      }
      const collapseMethod = props.collapseMethod || OioCollapseMethod.default;
      switch (collapseMethod) {
        case OioCollapseMethod.default:
          return undefined;
        case OioCollapseMethod.icon:
          return 'icon';
        case OioCollapseMethod.header:
          return 'header';
      }
      return undefined;
    });

    const allPanelKeys = ref<string[]>([]);

    const reportPanelKey = (key: string) => {
      if (!allPanelKeys.value.some((v) => v === key)) {
        allPanelKeys.value.push(key);
      }
    };

    useProviderOioCollapseContext({
      keys: computed(() => allPanelKeys.value),
      showArrow,
      collapsible,
      reportPanelKey
    });

    const instance: OioCollapseInstance = {
      getPanelKeys(): string[] {
        return [...allPanelKeys.value];
      }
    };

    context.expose(instance);

    return {
      bordered,
      ghost,
      collapsible,
      expandIconPosition
    };
  },
  render() {
    const {
      componentData,
      invisible,
      type,
      activeKey,
      bordered,
      ghost,
      accordion,
      collapsible,
      expandIconPosition,
      destroyInactivePanel
    } = this;
    const classNames = [`${DEFAULT_PREFIX}-collapse`];
    if (type) {
      classNames.push(`${DEFAULT_PREFIX}-collapse-${type}`);
    }
    return withDirectives(
      createVNode(
        ACollapse,
        {
          ...PropRecordHelper.collectionBasicProps(this.$attrs, classNames),
          ...(componentData || {}),
          activeKey,
          bordered,
          ghost,
          accordion,
          collapsible,
          expandIconPosition,
          destroyInactivePanel,
          'onUpdate:activeKey': (val) => this.$emit('update:active-key', val)
        },
        PropRecordHelper.collectionSlots(this.$slots, [
          {
            origin: 'default',
            isNotNull: true
          }
        ])
      ),
      [[vShow, !invisible]]
    );
  }
});
</script>
