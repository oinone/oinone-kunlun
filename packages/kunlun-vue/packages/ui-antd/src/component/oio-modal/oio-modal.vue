<script lang="ts">
import { CastHelper, StringHelper, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import {
  OioCloseIcon,
  OioModalProps,
  PropRecordHelper,
  StyleHelper,
  useDraggable,
  useModal
} from '@oinone/kunlun-vue-ui-common';
import { Modal as AModal } from 'ant-design-vue';
import { isBoolean } from 'lodash-es';
import { computed, createVNode, defineComponent, nextTick, ref, watch } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioButton } from '../oio-button';
import { OioSpin } from '../oio-spin';
import { OioTooltip, OioTooltipHelp } from '../oio-tooltip';

export default defineComponent({
  name: 'OioModal',
  components: {
    AModal,
    OioButton,
    OioSpin,
    OioTooltip
  },
  inheritAttrs: false,
  props: {
    ...OioModalProps
  },
  slots: ['default', 'title', 'header', 'footer', 'closeIcon'],
  emits: ['update:visible'],
  setup(props, context) {
    const internalId = `${DEFAULT_PREFIX}-modal-${uniqueKeyGenerator()}`;

    const modalRef = ref<HTMLElement | undefined>();
    const dragHandleRef = ref<HTMLElement | undefined>();
    const draggable = computed(() => props.draggable || false);

    useDraggable(modalRef, dragHandleRef, draggable);

    const id = computed<string>(() => {
      return props.wrapperProps?.id || internalId;
    });

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

    return {
      ...useModal(props, context),
      id
    };
  },
  render() {
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
      let titleSlot = slots.title;
      if (!titleSlot) {
        titleSlot = () => {
          const title = this.title || OioModalProps.title.default;
          return [createVNode('span', {}, this.$translate(title))];
        };
      }
      if (this.help) {
        const titleChildren = titleSlot();
        titleSlot = () => {
          return [createVNode('span', {}, titleChildren), createVNode(OioTooltipHelp, { content: this.help })];
        };
      }
      slots.title = titleSlot;
    }
    if (!slots.closeIcon) {
      slots.closeIcon = () => [createVNode(OioCloseIcon)];
    }

    const mainClassName = `${DEFAULT_PREFIX}-modal`;
    const classNames = [mainClassName];
    if (this.widthClassSuffix) {
      classNames.push(`${mainClassName}-width-${this.widthClassSuffix}`);
    }
    if (this.heightClassSuffix) {
      classNames.push(`${mainClassName}-height-${this.heightClassSuffix}`);
    }

    if (this.customHeightClassSuffix) {
      classNames.push(`${mainClassName}-height-${this.customHeightClassSuffix}`);
    }

    if (this.headerInvisible) {
      classNames.push(`${mainClassName}-header-invisible`);
    }
    if (this.footerInvisible) {
      classNames.push(`${mainClassName}-footer-invisible`);
    }
    return createVNode(
      AModal,
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, classNames),
        mask: this.mask,
        maskClosable: this.headerInvisible ? true : this.maskClosable,
        width: StyleHelper.px(this.width),
        wrapClassName: StringHelper.append([`${mainClassName}-wrapper`], CastHelper.cast(this.wrapperClassName)).join(
          ' '
        ),
        style: {
          [`--${mainClassName}-custom-height`]: this.heightPx
        },
        wrapProps: {
          ...(this.wrapperProps || {}),
          id: this.id
        },
        zIndex: this.zIndex,
        okText: this.$translate(this.enterText),
        cancelText: this.$translate(this.cancelText),
        visible: this.visible,
        closable: this.closable,
        keyboard: this.keyboard,
        destroyOnClose: this.destroyOnClose,
        getContainer: this.getTriggerContainer,
        confirmLoading: this.confirmLoading,
        onOk: this.enter,
        onCancel: this.cancel
      },
      {
        ...slots,
        default: defaultSlot
      }
    );
  }
});
</script>
