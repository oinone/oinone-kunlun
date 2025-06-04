<script lang="ts">
import {
  FormLayout,
  OioTabProps,
  PropRecordHelper,
  useInjectOioFormContext,
  useInjectOioTabsContext,
  useProviderOioFormContext
} from '@oinone/kunlun-vue-ui-common';
import { Tab as VanTab } from 'vant';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioTab',
  components: {
    VanTab
  },
  inheritAttrs: false,
  props: {
    ...OioTabProps
  },
  slots: ['default', 'tab'],
  setup(props) {
    const formContext = useInjectOioFormContext();
    const tabsContext = useInjectOioTabsContext();

    const layout = computed(() => {
      return (props.layout as FormLayout) || formContext.layout.value;
    });

    useProviderOioFormContext({
      ...formContext,
      layout
    });

    return {
      tabPosition: tabsContext.tabPosition
    };
  },
  render() {
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      }
    ]);
    return createVNode(
      VanTab,
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs),
        ...(this.componentData || {}),
        ...this.$attrs,
        forceRender: this.forceRender,
        disabled: this.disabled,
        title: this.tab
      },
      {
        default: () => {
          return [
            createVNode('div', { class: 'oio-tab' }, [
              createVNode(
                'div',
                { class: [`${DEFAULT_PREFIX}-tab-content`, `${DEFAULT_PREFIX}-tab-${this.tabPosition}-content`] },
                { default: () => slots.default() }
              )
            ])
          ];
        }
      }
    );
  }
});
</script>
