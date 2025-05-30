<script lang="ts">
import { DslDefinition, DslDefinitionType } from '@kunlun/dsl';
import { StringHelper } from '@kunlun/shared';
import { DEFAULT_PREFIX } from '@kunlun/theme';
import {
  OioCollapsePanelProps,
  PropRecordHelper,
  useInjectOioCollapseContext,
  useOioFormLayoutContext
} from '@kunlun/vue-ui-common';
import { DslRender } from '@kunlun/vue-widget';
import { CollapsePanel as ACollapsePanel } from 'ant-design-vue';
import { isNil } from 'lodash-es';
import {
  computed,
  createVNode,
  defineComponent,
  getCurrentInstance,
  onBeforeMount,
  PropType,
  vShow,
  withDirectives
} from 'vue';
import { InternalWidget, ResolveMode } from '../../tags/resolve/typing';

export default defineComponent({
  name: 'DefaultCollapsePanel',
  components: {
    ACollapsePanel
  },
  inheritAttrs: false,
  props: {
    ...OioCollapsePanelProps,
    currentHandle: {
      type: String
    },
    template: {
      type: Object as PropType<DslDefinition>
    }
  },
  slots: ['default', 'header', 'extra'],
  setup(props) {
    useOioFormLayoutContext(props);

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
      const key = props.currentHandle;
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
          ...(getCurrentInstance()?.parent?.attrs || {}),
          class: StringHelper.append(
            [`${DEFAULT_PREFIX}-collapse-panel`],
            getCurrentInstance()?.parent?.attrs?.class as string
          ),
          ref: 'origin',
          forceRender: this.forceRender,
          collapsible: this.collapsible,
          showArrow: this.showArrow
        },
        {
          ...slots,
          default: () => [
            DslRender.render({
              ...(this.template || {}),
              dslNodeType: DslDefinitionType.PACK,
              widgets: [],
              widget: InternalWidget.Row,
              parentHandle: this.currentHandle,
              resolveOptions: {
                mode: ResolveMode.NORMAL
              },
              __index: 0,
              __slots: {
                default: () => slots.default()
              }
            })
          ]
        }
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
