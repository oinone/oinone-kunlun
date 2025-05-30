<script lang="ts">
import { DEFAULT_PREFIX } from '@kunlun/theme';
import { ButtonType, OioButton, OioPopconfirm, PropRecordHelper } from '@kunlun/vue-ui-antd';
import { MenuItem as AMenuItem } from 'ant-design-vue';
import { computed, createVNode, defineComponent, VNode, vShow, withDirectives, withModifiers } from 'vue';
import { useInjectActionContext, useProviderActionContext } from '../context';
import { ActionProps, useAction } from './typing';
import MenuItem from './MenuItem.vue';

export default defineComponent({
  name: 'DefaultAction',
  components: {
    OioButton,
    OioPopconfirm,
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
      if (props.label) {
        contentVNode = createVNode('span', { class: `${DEFAULT_PREFIX}-action-content` }, props.label);
      }

      const attrs = {
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
        attrs['onClick'] = () => props.validateAndClick?.(props.action, true);
      }

      return createVNode(OioButton, attrs, () => {
        if (contentVNode) {
          return [contentVNode];
        }
        return [];
      });
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
