<script lang="ts">
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import { OioButton } from '@oinone/kunlun-vue-ui-antd';
import { ButtonType } from '@oinone/kunlun-vue-ui-common';
import { useOioState, Widget } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, VNode } from 'vue';
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
    }
  },
  setup(props) {
    const actionBarState = useOioState().viewState?.getActionBarState();

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

    const actionProps = computed<typeof ActionWidget['actionProps']>(() => {
      const widget = actionWidget.value;
      if (!widget) {
        return {};
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

    return {
      title,
      disabled,
      actionProps
    };
  },
  render() {
    const { title, disabled, actionProps } = this;
    return createVNode(
      MenuItem,
      {
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
            'data-action-name': actionProps.action.name
          };
          if (!actionProps.enableConfirm) {
            attrs.onClick = () => actionProps.validateAndClick?.(actionProps.action, true);
          }
          return [
            createVNode(OioButton, attrs, () => {
              if (contentVNode) {
                return [contentVNode];
              }
              return [];
            })
          ];
        }
      }
    );
  }
});
</script>
<style lang="scss"></style>
