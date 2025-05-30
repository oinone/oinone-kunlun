<script lang="ts">
import { DslDefinition } from '@kunlun/dsl';
import { CastHelper, StringHelper } from '@kunlun/shared';
import { IconPlacement, OioButton, OioDropdown, OioDropdownProps, PropRecordHelper } from '@kunlun/vue-ui-antd';
import { onAllMounted } from '@kunlun/vue-widget';
import { Menu as AMenu, Popover as APopover } from 'ant-design-vue';
import { isArray } from 'lodash-es';
import {
  computed,
  createVNode,
  defineComponent,
  nextTick,
  onMounted,
  PropType,
  ref,
  VNode,
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
  slots: ['default', 'trigger'],
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
<style lang="scss">
.default-dropdown-overlay {
  min-width: 96px;
  max-width: 160px;
  z-index: 999;

  .default-dropdown-menu {
    background-color: var(--oio-background);
    border: 1px solid var(--oio-border-color);
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    position: unset;
    padding: 7px 0;

    .ant-dropdown-menu-title-content {
      position: unset;

      .ant-modal-root {
        position: fixed;
        top: 0;
        left: 0;
      }
    }

    & > button {
      display: block;
      border: 0;
      border-bottom: 1px solid var(--oio-border-color);
      color: var(--oio-primary-color);
      border-radius: 0;

      &:hover {
        background: var(--oio-hover-background-color);
        border: 0;
        border-bottom: 1px solid var(--oio-border-color);
      }

      &:first-child {
        border-radius: 4px 4px 0 0;
      }

      &:last-child {
        border-radius: 0 0 4px 4px;
        border: 0;

        &:hover {
          border: 0;
        }
      }
    }

    .ant-dropdown-menu-item {
      padding: 6px 12px;

      &:not(:first-child) {
        margin-top: 7px;
      }

      &:not(:last-child) {
        margin-bottom: 7px;

        &:after {
          content: '';
          height: 1px;
          width: calc(100% - 16px);
          position: absolute;
          background-color: var(--oio-border-color);
          bottom: -4px;
          left: 8px;
        }
      }

      .oio-button {
        width: 100%;

        &.oio-button-icon-before,
        &.oio-button-icon-after {
          .oio-action-content {
            max-width: calc(100% - 18px);
          }
        }

        .oio-action-content {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }
      }

      &.ant-dropdown-menu-item-disabled:hover {
        background: var(--oio-disabled-color);
      }
    }
  }
}
</style>
