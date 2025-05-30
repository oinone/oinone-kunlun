<script lang="ts">
import { ObjectUtils, StringHelper } from '@kunlun/shared';
import { OioPopconfirmProps, PopconfirmPlacement, PropRecordHelper } from '@kunlun/vue-ui-common';
import { Popconfirm as APopconfirm, Popover as APopover } from 'ant-design-vue';
import { isBoolean, isFunction } from 'lodash-es';
import { computed, createVNode, defineComponent, h, ref, Slot } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioPopconfirm',
  components: {
    APopconfirm,
    APopover
  },
  inheritAttrs: false,
  props: {
    ...OioPopconfirmProps
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

    const placement = computed<string | undefined>(() => {
      const { placement: _placement } = props;
      if (!_placement) {
        return undefined;
      }
      switch (_placement) {
        case PopconfirmPlacement.tl:
          return 'topLeft';
        case PopconfirmPlacement.tm:
          return 'top';
        case PopconfirmPlacement.tr:
          return 'topRight';
        case PopconfirmPlacement.rt:
          return 'rightTop';
        case PopconfirmPlacement.rm:
          return 'right';
        case PopconfirmPlacement.rb:
          return 'rightBottom';
        case PopconfirmPlacement.bl:
          return 'bottomLeft';
        case PopconfirmPlacement.bm:
          return 'bottom';
        case PopconfirmPlacement.br:
          return 'bottomRight';
        case PopconfirmPlacement.lt:
          return 'leftTop';
        case PopconfirmPlacement.lm:
          return 'left';
        case PopconfirmPlacement.lb:
          return 'leftBottom';
        default:
          return 'top';
      }
    });

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

    return {
      visible,
      visibleChange,
      placement,
      confirm,
      cancel
    };
  },
  render() {
    const defaultSlot = this.$slots.default;
    if (defaultSlot) {
      const [title, icon] = ['title', 'icon'].map((name) => {
        const slot = this.$slots[name];
        return slot ? slot() : undefined;
      });
      const children: Record<string, Slot> = {
        default: defaultSlot
      };
      if (title) {
        children.title = () => title;
      } else {
        children.title = () => {
          return [
            h(
              'div',
              {
                class: `${DEFAULT_PREFIX}-popconfirm-content`
              },
              [
                h(
                  'div',
                  {
                    class: `${DEFAULT_PREFIX}-popconfirm-title`
                  },
                  [h('span', this.$translate(this.title))]
                ),
                h(
                  'p',
                  {
                    class: `${DEFAULT_PREFIX}-popconfirm-text`
                  },
                  this.$translate(this.text)
                )
              ]
            )
          ];
        };
      }
      if (icon) {
        children.icon = () => icon;
      }
      return createVNode(
        APopconfirm,
        {
          visible: this.visible,
          placement: this.placement,
          destroyTooltipOnHide: this.destroyOnClose,
          arrowPointAtCenter: true,
          okText: this.$translate(this.enterText),
          cancelText: this.$translate(this.cancelText),
          getPopupContainer: this.getTriggerContainer,
          ...PropRecordHelper.collectionBasicProps(this.$attrs),
          onVisibleChange: this.visibleChange,
          onConfirm: this.confirm,
          onCancel: this.cancel,
          overlayClassName: StringHelper.append([`${DEFAULT_PREFIX}-popconfirm-overlay`], this.overlayClassName).join(
            ' '
          )
        },
        children
      );
    }
    return [];
  }
});
</script>
