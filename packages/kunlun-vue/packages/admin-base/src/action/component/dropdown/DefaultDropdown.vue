<script lang="ts">
import type { DslDefinition } from '@oinone/kunlun-dsl';
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { IconPlacement, OioButton, OioDropdown, OioDropdownProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-antd';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { Menu as AMenu, Popover as APopover } from 'ant-design-vue';
import { isArray } from 'lodash-es';
import {
  computed,
  createVNode,
  defineComponent,
  nextTick,
  onMounted,
  type PropType,
  ref,
  type VNode,
  vShow,
  withDirectives
} from 'vue';
import { InternalWidget } from '../../../tags';
import { VNodeHelper } from '../../../util';
import { useProviderActionContext } from '../context';

export default defineComponent({
  name: 'DefaultDropdown',
  components: {
    APopover,
    OioButton,
    OioDropdown,
    AMenu
  },
  inheritAttrs: false,
  props: {
    ...OioDropdownProps,
    template: {
      type: Object as PropType<DslDefinition>
    },
    type: {
      type: String,
      default: 'primary'
    },
    label: {
      type: String
    },
    icon: {
      type: String
    },
    inline: {
      type: Boolean,
      default: false
    },
    invisible: {
      type: Boolean,
      default: false
    },
    allMounted: {
      type: Function
    }
  },
  setup(props, { slots }) {
    const needRenderOverlayChildren = ref(false);

    onAllMounted({
      allMounted: () => {
        props.allMounted?.();
      },
      allMountedUpdate: () => {
        props.allMounted?.();
      }
    });

    onMounted(async () => {
      await nextTick();

      let t = setTimeout(() => {
        needRenderOverlayChildren.value = true;
        clearTimeout(t);
        t = null as any;
      });
    });

    useProviderActionContext({
      isSelectItem: computed(() => true)
    });

    const overlayChildren = computed(() => {
      if (!needRenderOverlayChildren.value) {
        return null;
      }

      const currentSlots = slots as any;
      const defaultChildren = currentSlots.default();
      const children: VNode[] = [];
      const collectionNodes = (vnodes: VNode[]): boolean => {
        for (const vnode of vnodes) {
          if (VNodeHelper.isFragment(vnode)) {
            const fragmentChildren = vnode.children;
            if (isArray(fragmentChildren)) {
              if (!collectionNodes(vnode.children as VNode[])) {
                return false;
              }
            }
          } else if ((vnode.type as { name: string })?.name?.toLowerCase?.() === InternalWidget.Action) {
            children.push(vnode);
          }
        }
        return true;
      };
      collectionNodes(defaultChildren);

      return children;
    });

    return {
      overlayChildren
    };
  },
  render() {
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default', isNotNull: true },
      { origin: 'trigger', isNotNull: true }
    ]);

    const createTriggerNode = () => {
      let triggerNode = slots.trigger()[0];
      if (!triggerNode) {
        if (this.inline) {
          triggerNode = createVNode(
            OioButton,
            {
              class: StringHelper.append([], CastHelper.cast(this.template?.class || this.$attrs.class)),
              type: this.type,
              icon: this.icon,
              iconPlacement: IconPlacement.AFTER
            },
            {
              default: () => this.label
            }
          );
        } else {
          triggerNode = createVNode(
            OioButton,
            {
              class: 'oio-action-item',
              type: this.type
            },
            {
              default: () => this.label
            }
          );
        }
      }
      return triggerNode;
    };
    const triggerNode = createTriggerNode();
    return createVNode(
      OioDropdown,
      {
        disabled: this.disabled,
        trigger: this.trigger,
        placement: this.placement,
        overlayClassName: StringHelper.append(['default-dropdown-overlay'], CastHelper.cast(this.overlayClassName)),
        overlayStyle: this.overlayStyle,
        forceRender: true,
        destroyOnHide: false,
        getTriggerContainer: this.getTriggerContainer
      },
      {
        default: () => [withDirectives(triggerNode, [[vShow, !this.invisible]])],
        overlay: () => [
          createVNode(
            AMenu,
            {
              class: 'default-dropdown-menu'
            },
            {
              default: () => this.overlayChildren
            }
          )
        ]
      }
    );
  }
});
</script>
