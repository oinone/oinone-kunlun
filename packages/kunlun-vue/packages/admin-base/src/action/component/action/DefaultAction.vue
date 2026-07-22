<script lang="ts">
import { translateValueByKey } from '@oinone/kunlun-engine';
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import { ButtonType, OioButton, OioPopconfirm, OioTooltip, PropRecordHelper } from '@oinone/kunlun-vue-ui-antd';
import { MenuItem as AMenuItem } from 'ant-design-vue';
import { computed, createVNode, defineComponent, type VNode, vShow, withDirectives, withModifiers } from 'vue';
import { useInjectActionContext, useProviderActionContext } from '../context';
import MenuItem from './MenuItem.vue';
import { ActionProps, useAction } from './typing';

export default defineComponent({
  name: 'DefaultAction',
  components: {
    OioButton,
    OioPopconfirm,
    OioTooltip,
    AMenuItem
  },
  inheritAttrs: false,
  props: {
    ...ActionProps,
    enableConfirm: {
      type: Boolean,
      default: false
    },
    visibleConfirm: {
      type: Boolean,
      default: false
    },
    changeVisibleConfirm: {
      type: Function,
      default: () => {}
    }
  },
  setup(props) {
    const actionContext = useInjectActionContext();

    useProviderActionContext({});

    const actionProps = useAction(props);

    const ButtonVNode = computed(() => {
      let contentVNode: VNode | undefined;
      if (!props.labelInvisible && props.label) {
        contentVNode = createVNode(
          'span',
          { class: `${DEFAULT_PREFIX}-action-content` },
          translateValueByKey(props.label)
        );
      }

      const attrs: Record<string, unknown> = {
        ref: 'origin',
        type: actionContext.isSelectItem.value ? ButtonType.link : props.type,
        bizStyle: props.bizStyle,
        loading: props.loading,
        disabled: props.disabled,
        title: props.disabled ? props.disabledTitle || props.help || props.label : props.help || props.label,
        icon: props.icon,
        'data-action-name': props.action?.name
      };

      if (!props.enableConfirm) {
        attrs.onClick = () => props.validateAndClick?.(props.action, true);
      }

      const buttonVNode = createVNode(OioButton, attrs, () => {
        if (contentVNode) {
          return [contentVNode];
        }
        return [];
      });

      if (props.tooltip === undefined) {
        return buttonVNode;
      }

      return createVNode(
        OioTooltip,
        {},
        {
          default: () => [buttonVNode],
          title: () =>
            typeof props.tooltip === 'string' ? [createVNode('span', { innerHTML: props.tooltip })] : [props.tooltip]
        }
      );
    });

    const PopConfirmVNode = computed(() =>
      props.enableConfirm
        ? createVNode(
            OioPopconfirm,
            {
              title: props.confirmTitle,
              placement: props.confirmPosition,
              text: props.confirm,
              enterText: props.enterText,
              cancelText: props.cancelText,
              visible: props.visibleConfirm,
              'onUpdate:visible': props.changeVisibleConfirm,
              condition: actionProps.condition,
              confirmCallback: () => props.validateAndClick?.(props.action, true)
            },
            {
              default: () => [ButtonVNode.value]
            }
          )
        : ButtonVNode.value
    );

    return {
      ButtonVNode,
      PopConfirmVNode,

      ...actionProps,
      ...actionContext
    };
  },
  render() {
    if (this.isSelectItem) {
      if (this.invisible) {
        return [];
      }
      return createVNode(
        // 解决AMenuItem会导致dropdown内无法打开抽屉的问题
        MenuItem,
        {
          ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-more-action-item`]),
          disabled: this.disabled,
          title: this.disabled ? this.disabledTitle : this.label
        },
        {
          default: () => {
            return [
              this.PopConfirmVNode,
              ...PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }]).default()
            ];
          }
        }
      );
    }
    return withDirectives(
      createVNode(
        'div',
        {
          ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-action-item`]),
          'data-invisible': this.invisible,
          onClick: withModifiers(() => {}, ['stop', 'prevent'])
        },
        [
          this.PopConfirmVNode,
          ...PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }]).default()
        ]
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
