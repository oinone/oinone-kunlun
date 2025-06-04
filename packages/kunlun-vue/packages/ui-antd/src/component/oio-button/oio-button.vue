<script lang="ts">
import {
  ButtonBizStyle,
  ButtonType,
  IconPlacement,
  OioButtonProps,
  OioIcon,
  PropRecordHelper
} from '@oinone/kunlun-vue-ui-common';
import { Button as AButton } from 'ant-design-vue';
import { isEmpty } from 'lodash-es';
import { computed, createVNode, defineComponent, nextTick, reactive, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

interface State {
  loading: boolean;
}

function isChildrenEmpty(children: VNode[]): boolean {
  if (children.length === 0) {
    return true;
  }
  if (children.length === 1) {
    const textVNode = children[0];
    if (textVNode.type.toString() === 'Symbol(Text)') {
      return isEmpty(textVNode.children);
    }
  }
  return false;
}

export default defineComponent({
  name: 'OioButton',
  components: {
    AButton,
    OioIcon
  },
  inheritAttrs: false,
  props: {
    ...OioButtonProps
  },
  slots: ['default', 'icon', 'update:loading', 'update:selected'],
  setup(props, context) {
    const state = reactive<State>({
      loading: false
    });

    const internalLoading = computed<boolean>({
      get: () => {
        const currentLoading = props.loading;
        if (currentLoading == null) {
          return state.loading;
        }
        return currentLoading;
      },
      set: (val: boolean) => {
        state.loading = val;
        context.emit('update:loading', val);
      }
    });

    const onClick = (...args) => {
      const fn = context.attrs.onClick as Function;
      if (!fn) {
        return;
      }
      if (props.async) {
        internalLoading.value = true;
        nextTick(() => fn?.(...args)).finally(() => {
          internalLoading.value = false;
        });
      } else {
        fn?.(...args);
      }
      if (props.selected != null) {
        context.emit('update:selected', !props.selected);
      }
    };

    const bizStyle = computed(() => {
      if (props.disabled || props.bizStyle === ButtonBizStyle.default) {
        return undefined;
      }
      return props.bizStyle;
    });

    return {
      state,
      internalLoading,
      bizStyle,
      onClick
    };
  },
  render() {
    const { type, htmlType, block, href, target, internalLoading, disabled, onClick, selected } = this;
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      },
      'icon'
    ]);
    if (!slots.icon && this.icon) {
      slots.icon = () => [createVNode(OioIcon, { icon: this.icon })];
    }
    const buttonClassList = [`${DEFAULT_PREFIX}-button`, `${DEFAULT_PREFIX}-button-${this.type}`];
    if (this.bizStyle) {
      buttonClassList.push(`${DEFAULT_PREFIX}-button-biz-type-${this.bizStyle}`);
    }
    if (type === ButtonType.link && selected != null) {
      if (selected) {
        buttonClassList.push(`${DEFAULT_PREFIX}-button-selected`);
      }
    }
    let children = slots.default?.() || [];
    if (slots.icon) {
      if (isChildrenEmpty(children)) {
        buttonClassList.push(`${DEFAULT_PREFIX}-button-icon-only`);
      } else {
        buttonClassList.push(`${DEFAULT_PREFIX}-button-icon-${this.iconPlacement}`);
      }
      switch (this.iconPlacement) {
        case IconPlacement.BEFORE:
          children = [...slots.icon(), ...children];
          break;
        case IconPlacement.AFTER:
          children = [...children, ...slots.icon()];
          break;
        default:
          break;
      }
    }
    if (href) {
      buttonClassList.push(`${DEFAULT_PREFIX}-button-href-button`);
      children.push(createVNode('a', { href, target }));
    }
    return createVNode(
      AButton,
      {
        type,
        block,
        loading: internalLoading,
        disabled,
        htmlType,
        ...PropRecordHelper.collectionBasicProps(this.$attrs, buttonClassList),
        onClick
      },
      {
        default: () => children
      }
    );
  }
});
</script>
