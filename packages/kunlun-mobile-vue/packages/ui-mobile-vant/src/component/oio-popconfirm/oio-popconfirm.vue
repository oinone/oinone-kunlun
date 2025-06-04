<script lang="ts">
import { ObjectUtils, StringHelper } from '@oinone/kunlun-shared';
import { OioPopconfirmProps } from '@oinone/kunlun-vue-ui-common';
import { isBoolean, isFunction } from 'lodash-es';
import { cloneVNode, computed, createVNode, defineComponent, Fragment, h, ref, Slot } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioDialog } from '../oio-dialog';

export default defineComponent({
  name: 'OioPopconfirm',
  components: {
    OioDialog
  },
  inheritAttrs: false,
  props: {
    ...OioPopconfirmProps,
    teleport: {
      type: [String, HTMLElement],
      default: 'body'
    }
  },
  emits: ['update:visible'],
  setup(props, context) {
    const _visible = ref<boolean>(false);

    const rawVisibleChange = (val: boolean) => {
      if (isBoolean(props.visible)) {
        context.emit('update:visible', val);
      } else {
        _visible.value = val;
      }
    };

    const visible = computed<boolean>({
      get() {
        return isBoolean(props.visible) ? props.visible : _visible.value;
      },
      set(val) {
        if (props.manual) {
          return;
        }
        rawVisibleChange(val);
      }
    });

    const visibleChange = async (val: boolean) => {
      if (!val) {
        visible.value = false;
        return;
      }
      if (isBoolean(props.condition)) {
        if (props.condition) {
          visible.value = val;
        } else {
          confirm();
        }
      } else if (isFunction(props.condition)) {
        const result = await props.condition();
        if (ObjectUtils.isNotEmpty(result)) {
          if (result) {
            visible.value = val;
          } else {
            confirm();
          }
        }
      } else {
        visible.value = val;
      }
    };

    const confirm = () => {
      visible.value = false;
      if (props.confirmCallback) {
        props.confirmCallback();
      }
    };

    const cancel = () => {
      visible.value = false;
      if (props.cancelCallback) {
        props.cancelCallback();
      }
    };

    const overlayClass = StringHelper.append([`${DEFAULT_PREFIX}-popconfirm-overlay`], props.overlayClassName).join(
      ' '
    );

    return {
      visible,
      visibleChange,
      confirm,
      cancel,
      overlayClass
    };
  },
  render() {
    const defaultSlot = this.$slots.default;
    if (defaultSlot) {
      const [titleSlot, iconSlot] = ['title', 'icon'].map((name) => {
        const slot = this.$slots[name];
        return slot ? slot() : undefined;
      });
      const children: Record<string, Slot> = {
        default: defaultSlot
      };
      if (titleSlot) {
        children.title = () => titleSlot;
      }
      if (iconSlot) {
        children.icon = () => iconSlot;
      }
      return createVNode(Fragment, {}, [
        this.visible
          ? createVNode(
              OioDialog,
              {
                teleport: this.teleport,
                visible: this.visible,
                'onUpdate:visible': (val) => (this.visible = val),
                title: this.title,
                message: this.text,
                overlayClass: this.overlayClass,
                enterText: this.enterText,
                cancelText: this.cancelText,
                enterCallback: this.confirm,
                cancelCallback: this.cancel
              },
              { title: () => [children.title?.()] }
            )
          : null,
        createVNode(Fragment, null, [
          children.icon?.(),
          cloneVNode(children.default()[0], {
            onClick: () => {
              this.visibleChange(true);
            }
          })
        ])
      ]);
    }
    return [];
  }
});
</script>
