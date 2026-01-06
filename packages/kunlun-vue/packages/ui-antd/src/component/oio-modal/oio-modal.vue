<script lang="ts">
import { CastHelper, type CSSStyle, StringHelper, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import {
  OioCloseIcon,
  OioIcon,
  OioModalProps,
  PopupDisplayAs,
  PropRecordHelper,
  StyleHelper,
  useDraggable,
  useInjectOioDefaultFormContext,
  useModal,
  useProviderOioDefaultFormContext
} from '@oinone/kunlun-vue-ui-common';
import { Modal as AModal } from 'ant-design-vue';
import { isBoolean } from 'lodash-es';
import { computed, createVNode, defineComponent, nextTick, ref, watch, withModifiers } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioButton } from '../oio-button';
import { OioSpin } from '../oio-spin';
import { OioTooltip } from '../oio-tooltip';

export default defineComponent({
  name: 'OioModal',
  components: {
    AModal,
    OioButton,
    OioSpin,
    OioTooltip,
    OioIcon
  },
  inheritAttrs: false,
  props: {
    ...OioModalProps
  },
  emits: ['update:visible', 'update:displayAs', 'enter', 'cancel'],
  setup(props, context) {
    const formContext = useInjectOioDefaultFormContext();

    const internalId = `${DEFAULT_PREFIX}-modal-${uniqueKeyGenerator()}`;

    const modalRef = ref<HTMLElement | undefined>();
    const dragHandleRef = ref<HTMLElement | undefined>();
    const draggable = computed(() => props.draggable || false);

    useDraggable(modalRef, dragHandleRef, draggable);

    const id = computed<string>(() => {
      return props.wrapperProps?.id || internalId;
    });

    const onUpdateVisible = (val: boolean) => {
      context.emit('update:visible', val);
    };

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          nextTick(() => {
            const modalDom = document.getElementById(id.value)?.firstElementChild;
            if (!modalDom) {
              return;
            }
            let dragHandleDom: Element | undefined;
            if (props.headerInvisible) {
              [dragHandleDom] = modalDom.getElementsByClassName('ant-modal-body');
            } else {
              [dragHandleDom] = modalDom.getElementsByClassName('ant-modal-header');
            }
            if (!dragHandleDom) {
              return;
            }
            dragHandleRef.value = dragHandleDom as HTMLElement;
            modalRef.value = modalDom as HTMLElement;
          });
        } else {
          modalRef.value = undefined;
          dragHandleRef.value = undefined;
        }
      },
      { immediate: true }
    );

    useProviderOioDefaultFormContext({
      ...formContext,
      getTriggerContainer() {
        return document.body;
      }
    });

    return {
      ...useModal(props, context),
      id,
      onUpdateVisible
    };
  },
  render() {
    const mainClassName = `${DEFAULT_PREFIX}-modal`;

    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      },
      'title',
      'header',
      'footer',
      'closeIcon'
    ]);
    let defaultSlot = slots.default;
    const finalDefaultSlot = defaultSlot({ data: this.data });
    if (isBoolean(this.loading)) {
      defaultSlot = () => [
        createVNode(
          OioSpin,
          {
            loading: this.loading
          },
          {
            default: () => finalDefaultSlot
          }
        )
      ];
    } else {
      defaultSlot = () => finalDefaultSlot;
    }

    const isOverrideTitle = !!slots.header;
    if (!isOverrideTitle) {
      const originalTitleSlot = slots.title;

      // 默认标题插槽
      const createDefaultTitle = () => [createVNode('span', {}, this.$translate(this.title || '弹窗'))];

      slots.title = () => {
        // 获取原始或默认的标题插槽
        const originalSlot = [...(originalTitleSlot?.() || createDefaultTitle())];

        if (this.help) {
          originalSlot.push(
            createVNode(OioTooltip, {
              content: this.help
            })
          );
        }

        // 控制图标
        const controlIcons = [
          this.showPopupToggle &&
            !this.isFullScreen &&
            createVNode(OioIcon, {
              style: { cursor: 'pointer' },
              icon: this.displayAs === PopupDisplayAs.modal ? 'oinone-drawer' : 'oinone-dialog',
              size: 16,
              onClick: withModifiers(this.onDisplayAsSwitch, ['stop'])
            }),
          this.enabledFullScreen &&
            createVNode(OioIcon, {
              style: { cursor: 'pointer' },
              icon: this.isFullScreen ? 'oinone-suoxiao1' : 'oinone-fangda2',
              size: 16,
              onClick: withModifiers(this.onFullSwitch, ['stop'])
            })
        ].filter(Boolean);

        // 包装控制区域
        if (controlIcons.length > 0) {
          originalSlot.push(
            createVNode(
              'div',
              {
                class: `${mainClassName}-title-extend`
              },
              controlIcons
            )
          );
        }

        return originalSlot;
      };
    }

    if (!slots.closeIcon) {
      slots.closeIcon = () => [createVNode(OioCloseIcon)];
    }

    const classNames = [mainClassName];
    if (this.widthClassSuffix) {
      classNames.push(`${mainClassName}-width-${this.widthClassSuffix}`);
    }
    if (this.heightClassSuffix) {
      classNames.push(`${mainClassName}-height-${this.heightClassSuffix}`);
    }
    if (this.headerInvisible) {
      classNames.push(`${mainClassName}-header-invisible`);
    }
    if (this.footerInvisible) {
      classNames.push(`${mainClassName}-footer-invisible`);
    }

    const style = {} as CSSStyle;
    if (!this.heightClassSuffix && this.height) {
      classNames.push(`${mainClassName}-height-custom`);
      style[`--${mainClassName}-custom-height`] = StyleHelper.px(this.height)!;
    }

    return createVNode(
      AModal,
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, classNames, style),
        mask: this.mask,
        maskClosable: this.headerInvisible ? true : this.maskClosable,
        width: this.width,
        wrapClassName: StringHelper.append(
          [`${mainClassName}-wrapper`],
          CastHelper.cast(this.wrapperClassName),
          this.drawerModalClassName
        ).join(' '),
        wrapProps: {
          ...(this.wrapperProps || {}),
          id: this.id
        },
        bodyStyle: this.wrapperProps?.bodyStyle,
        maskStyle: this.wrapperProps?.maskStyle,
        zIndex: this.zIndex,
        okText: this.$translate(this.enterText),
        cancelText: this.$translate(this.cancelText),
        open: this.visible,
        closable: this.closable,
        keyboard: this.keyboard,
        destroyOnClose: this.destroyOnClose,
        getContainer: this.getTriggerContainer,
        confirmLoading: this.confirmLoading,
        onOk: this.enter,
        onCancel: this.cancel,
        'onUpdate:open': this.onUpdateVisible
      },
      {
        ...slots,
        default: defaultSlot
      }
    );
  }
});
</script>
