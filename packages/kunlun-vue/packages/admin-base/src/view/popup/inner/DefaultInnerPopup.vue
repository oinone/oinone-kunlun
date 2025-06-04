<script lang="ts">
import { ButtonType, OioButton, OioInnerPopup, StringHelper } from '@oinone/kunlun-vue-ui-antd';
import { DrawerPlacement, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, PropType, Slot, VNode } from 'vue';
import { ViewType } from '@oinone/kunlun-meta';

export default defineComponent({
  name: 'DefaultInnerPopup',
  components: {
    OioInnerPopup,
    OioButton
  },
  inheritAttrs: false,
  props: {
    teleportHandle: {
      type: String,
      required: true
    },
    title: {
      type: String
    },
    help: {
      type: String
    },
    visible: {
      type: Boolean
    },
    class: {
      type: String
    },
    placement: {
      type: String,
      default: DrawerPlacement.right
    },
    closable: {
      type: Boolean,
      default: true
    },
    okText: {
      type: String
    },
    okInvisible: {
      type: Boolean,
      default: undefined
    },
    onOk: {
      type: Function
    },
    cancelText: {
      type: String
    },
    cancelInvisible: {
      type: Boolean,
      default: undefined
    },
    headerInvisible: {
      type: Boolean,
      default: undefined
    },
    footerInvisible: {
      type: Boolean,
      default: undefined
    },
    onCancel: {
      type: Function
    },
    translate: {
      type: Function
    },
    viewType: {
      type: String as PropType<ViewType>
    },
    allMounted: {
      type: Function
    },
    height: {
      type: String
    }
  },
  setup(props) {
    onAllMounted(() => {
      props.allMounted?.();
    });

    const teleportTarget = computed<HTMLElement>(() => {
      const handle = props.teleportHandle;
      if (!handle) {
        throw new Error('Invalid teleport handle.');
      }
      return document.getElementById(handle) || document.body;
    });

    return {
      teleportTarget
    };
  },
  render() {
    const {
      teleportTarget,
      title,
      help,
      visible,
      placement,
      closable,
      okText,
      okInvisible,
      cancelText,
      cancelInvisible,
      headerInvisible,
      footerInvisible,
      viewType,
      height
    } = this;
    const slots: Record<string, Slot | null> = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      },
      {
        origin: 'footer',
        default: () => {
          const footerChildren: VNode[] = [];
          if (!cancelInvisible) {
            footerChildren.push(
              createVNode(
                OioButton,
                {
                  onClick: this.onCancel
                },
                { default: () => cancelText || this.translate?.('kunlun.common.cancel') }
              )
            );
          }
          if (!okInvisible) {
            footerChildren.push(
              createVNode(
                OioButton,
                {
                  type: ButtonType.primary,
                  async: true,
                  onClick: this.onOk
                },
                { default: () => okText || this.translate?.('kunlun.common.confirm') }
              )
            );
          }
          return footerChildren;
        }
      }
    ]);

    const componentProps: Record<string, unknown> = {
      class: StringHelper.append(
        [`default-inner-popup default-inner-popup-${viewType?.toLowerCase()}`],
        this.class
      ),
      style: {
        height
      },
      teleport: teleportTarget,
      title,
      help,
      visible,
      placement,
      closable,
      resizable: true,
      cancelCallback: this.onCancel
    };

    if (headerInvisible) {
      componentProps.header = null;
      slots.header = null;
    }

    if (footerInvisible) {
      componentProps.footer = null;
      slots.footer = null;
    }

    return [createVNode(OioInnerPopup, componentProps, slots)];
  }
});
</script>
<style lang="scss">
.default-inner-popup {
  .oio-inner-popup-footer {
    padding: 4px;

    .action-bar {
      height: unset;
      padding: 12px;
      justify-content: flex-end;
    }
  }
}
</style>
