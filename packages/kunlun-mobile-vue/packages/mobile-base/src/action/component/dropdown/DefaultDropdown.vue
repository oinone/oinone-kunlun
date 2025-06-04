<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import {
  DEFAULT_PREFIX,
  IconPlacement,
  OioButton,
  OioDropdownProps,
  PropRecordHelper
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { isArray } from 'lodash-es';
import { cloneVNode, createVNode, defineComponent, Fragment, PropType, ref, VNode, watch } from 'vue';
import { InternalWidget } from '../../../tags';
import { Popover as VanPopover, Popup as VanPopup } from 'vant';
import { VNodeHelper } from '../../../util';

const fragmentVNodeType = 'Symbol(Fragment)';

function isFragment(vns: VNode) {
  return vns.type.toString() === fragmentVNodeType;
}

export default defineComponent({
  name: 'DefaultDropdown',
  components: {
    OioButton,
    VanPopup,
    VanPopover
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
    },
    subActionBar: {
      type: Boolean,
      default: false
    },
    showActionPopup: Boolean,
    onShowActionsPopup: Function
  },
  slots: ['default', 'trigger'],
  setup(props) {
    onAllMounted({
      allMounted: () => {
        props.allMounted?.();
      },
      allMountedUpdate: () => {
        props.allMounted?.();
      }
    });
    const show = ref(false);
    watch(
      () => props.showActionPopup,
      () => {
        show.value = props.showActionPopup;
      }
    );
    return { show };
  },
  render() {
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default', isNotNull: true },
      { origin: 'trigger', isNotNull: true }
    ]);
    const defaultChildren = slots.default();
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
          const vNodeProps = vnode.props;
          if (vNodeProps) {
            // vNodeProps.isSelectItem = true;
            children.push(vnode);
          }
        }
      }
      return true;
    };
    collectionNodes(defaultChildren);
    const createTriggerNode = () => {
      let triggerNode = slots.trigger()[0];
      if (!triggerNode) {
        if (this.inline || this.subActionBar) {
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
              class: `${DEFAULT_PREFIX}-action-item`,
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

    const props = {
      show: this.show,
      'onUpdate:show': (v) => {
        this.show = v;
        this.onShowActionsPopup?.(v);
      },
      class: StringHelper.append(
        [this.subActionBar ? `${DEFAULT_PREFIX}-action-dropdown-inline` : ''],
        CastHelper.cast(this.$attrs.class)
      ),
      overlayClass: StringHelper.append(['default-dropdown-overlay'], CastHelper.cast(this.overlayClassName)),
      overlayStyle: this.overlayStyle,
      teleport: this.getTriggerContainer || 'body',
      safeAreaInsetBottom: this.subActionBar
    } as any;
    if (this.subActionBar) {
      props.position = 'bottom';
    } else {
      props.trigger = this.trigger;
      props.placement = this.placement;
    }
    const node = createVNode(
      this.subActionBar ? VanPopup : VanPopover,
      props,
      this.subActionBar
        ? {
            default: () => createVNode('div', { class: `${DEFAULT_PREFIX}-action-dropdown-content` }, children)
          }
        : {
            reference: () => [triggerNode],
            default: () => children
          }
    );
    return !this.subActionBar
      ? node
      : createVNode(Fragment, null, [
          cloneVNode(triggerNode, {
            onClick: () => {
              this.show = !this.show;
              this.onShowActionsPopup?.(this.show);
            }
          }),
          node
        ]);
  }
});
</script>
