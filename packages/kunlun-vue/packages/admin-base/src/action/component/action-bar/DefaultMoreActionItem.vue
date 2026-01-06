<script lang="ts">
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import { ObjectUtils, OioButton, OioPopconfirm } from '@oinone/kunlun-vue-ui-antd';
import { ButtonType } from '@oinone/kunlun-vue-ui-common';
import { useOioState, Widget } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, ref, type VNode } from 'vue';
import type { ActionWidget } from '../action';
import MenuItem from '../action/MenuItem.vue';

export default defineComponent({
  name: 'DefaultMoreActionItem',
  components: {},
  inheritAttrs: false,
  props: {
    model: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rowIndex: {
      type: Number
    }
  },
  setup(props) {
    // 二次确认的显示和隐藏不同步 ActionWidget，否则页面会出现多个二次确认弹出层
    const visibleConfirm = ref(false);
    const actionBarState = useOioState().viewState?.getActionBarState(props.rowIndex);

    const actionWidget = computed<ActionWidget | undefined>(() => {
      const actionHandles = actionBarState?.actions;
      if (!actionHandles) {
        return undefined;
      }
      for (const actionHandle of actionHandles) {
        const widget = Widget.select<ActionWidget>(actionHandle)?.getOperator<ActionWidget>();
        if (!widget) {
          continue;
        }
        const action = widget.action;
        if (!action) {
          continue;
        }
        if (action.model === props.model && action.name === props.name) {
          return widget;
        }
      }
      return undefined;
    });

    const actionProps = computed<ActionWidget['actionProps']>(() => {
      const widget = actionWidget.value;
      if (!widget) {
        return {} as ActionWidget['actionProps'];
      }
      return widget.actionProps;
    });

    const title = computed(() => {
      const widget = actionWidget.value;
      if (!widget) {
        return undefined;
      }
      if (widget.disabled) {
        return widget.disabledTitle;
      }
      return widget.actionProps.label;
    });

    const disabled = computed(() => {
      const widget = actionWidget.value;
      if (!widget) {
        return false;
      }
      return widget.disabled;
    });

    const condition = async () => {
      if (ObjectUtils.isNotEmpty(actionProps.value.confirm)) {
        if (actionProps.value.validatorForm) {
          if (!(await actionProps.value.validatorForm?.())) {
            return undefined;
          }
        }
        return true;
      }
      return false;
    };

    const onUpdateVisibleConfirm = (val: boolean) => {
      visibleConfirm.value = val;
    };

    return {
      visibleConfirm,
      title,
      disabled,
      actionProps,
      condition,
      onUpdateVisibleConfirm
    };
  },
  render() {
    const { visibleConfirm, title, disabled, actionProps, condition, onUpdateVisibleConfirm } = this;
    if (actionProps.invisible) {
      return [];
    }
    return createVNode(
      MenuItem,
      {
        class: `${DEFAULT_PREFIX}-more-action-item`,
        disabled,
        title
      },
      {
        default: () => {
          let contentVNode: VNode | undefined;
          if (!actionProps.labelInvisible && actionProps.label) {
            contentVNode = createVNode('span', { class: `${DEFAULT_PREFIX}-action-content` }, actionProps.label);
          }
          const attrs: Record<string, unknown> = {
            ref: 'origin',
            type: ButtonType.link,
            bizStyle: actionProps.bizStyle,
            loading: actionProps.loading,
            disabled: actionProps.disabled,
            title: actionProps.disabled
              ? actionProps.disabledTitle || actionProps.help || actionProps.label
              : actionProps.help || actionProps.label,
            icon: actionProps.icon,
            'data-action-name': actionProps.action?.name
          };
          if (!actionProps.enableConfirm) {
            attrs.onClick = () => actionProps.validateAndClick?.(actionProps.action, true);
          }
          const btn = createVNode(OioButton, attrs, () => {
            if (contentVNode) {
              return [contentVNode];
            }
            return [];
          });
          if (actionProps.enableConfirm) {
            return [
              createVNode(
                OioPopconfirm,
                {
                  title: actionProps.confirmTitle,
                  placement: actionProps.confirmPosition,
                  text: actionProps.confirm,
                  enterText: actionProps.enterText,
                  cancelText: actionProps.cancelText,
                  visible: visibleConfirm,
                  'onUpdate:visible': onUpdateVisibleConfirm,
                  condition,
                  confirmCallback: () => actionProps.validateAndClick?.(actionProps.action, true)
                },
                {
                  default: () => [btn]
                }
              )
            ];
          }
          return [btn];
        }
      }
    );
  }
});
</script>
<style lang="scss"></style>
