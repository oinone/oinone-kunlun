<script lang="ts">
import {
  getVNodeKey,
  OioCollapsePanelProps,
  PropRecordHelper,
  useInjectOioCollapseContext,
  useOioFormLayoutContext
} from '@kunlun/vue-ui-common';
import { CollapsePanel as ACollapsePanel } from 'ant-design-vue';
import { isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, onBeforeMount, vShow, withDirectives } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioCollapsePanel',
  components: {
    ACollapsePanel
  },
  inheritAttrs: false,
  props: {
    ...OioCollapsePanelProps
  },
  slots: ['default', 'header', 'extra'],
  setup(props) {
    useOioFormLayoutContext(props);

    const key = getVNodeKey();

    const collapseContext = useInjectOioCollapseContext();

    const showArrow = computed(() => {
      const showAllow = props.showArrow;
      if (isNil(showAllow)) {
        return collapseContext.showArrow.value;
      }
      return showArrow;
    });

    const collapsible = computed(() => {
      if (props.disabled) {
        return 'disabled';
      }
      const collapsible = props.collapseMethod;
      if (isNil(collapsible)) {
        return collapseContext.collapsible.value;
      }
      return collapsible;
    });

    onBeforeMount(() => {
      if (!key) {
        return;
      }
      collapseContext.reportPanelKey(key);
    });

    return {
      showArrow,
      collapsible
    };
  },
  render() {
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      },
      'header',
      'extra'
    ]);
    return withDirectives(
      createVNode(
        ACollapsePanel,
        {
          ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-collapse-panel`]),
          ...(this.componentData || {}),
          ...this.$attrs,
          forceRender: this.forceRender,
          header: this.header,
          collapsible: this.collapsible,
          showArrow: this.showArrow
        },
        {
          ...slots,
          default: () => slots.default()
        }
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
