<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import {
  OioCloseIcon,
  OioDrawerProps,
  OioIcon,
  PropRecordHelper,
  StyleHelper,
  useDrawer
} from '@oinone/kunlun-vue-ui-common';
import { Drawer as ADrawer } from 'ant-design-vue';
import { isBoolean } from 'lodash-es';
import { createVNode, defineComponent, withModifiers } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioButton } from '../oio-button';
import { OioSpin } from '../oio-spin';
import { OioTooltipHelp } from '../oio-tooltip';

export default defineComponent({
  name: 'OioDrawer',
  components: {
    ADrawer,
    OioButton,
    OioSpin,
    OioIcon
  },
  inheritAttrs: false,
  props: {
    ...OioDrawerProps
  },
  slots: ['default', 'title', 'header', 'footer', 'closeIcon'],
  emits: ['update:visible'],
  setup(props, context) {
    return {
      ...useDrawer(props, context)
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
    const mainClassName = `${DEFAULT_PREFIX}-drawer`;

    let finalDefaultSlot = [
      createVNode('div', { class: `${mainClassName}-content` }, slots.default({ data: this.data }))
    ];
    if (isBoolean(this.loading)) {
      const spinDefaultSlot = finalDefaultSlot;
      finalDefaultSlot = [
        createVNode(
          OioSpin,
          {
            loading: this.loading
          },
          {
            default: () => spinDefaultSlot
          }
        )
      ];
    }
    const isOverrideTitle = !!slots.header;
    if (!isOverrideTitle) {
      const originalTitleSlot = slots.title;

      // 默认标题插槽
      const createDefaultTitle = () => [
        createVNode('span', {}, this.$translate(this.title || OioDrawerProps.title.default))
      ];

      slots.title = () => {
        // 获取原始或默认的标题插槽
        const originalSlot = [...(originalTitleSlot?.() || createDefaultTitle())];

        if (this.help) {
          originalSlot.push(
            createVNode(OioTooltipHelp, {
              content: this.help
            })
          );
        }

        // 控制图标
        const controlIcons = [
          this.showDisplayAs &&
            createVNode(OioIcon, {
              style: { cursor: 'pointer' },
              icon: this.modalDrawerClassName ? 'oinone-chouti' : 'oinone-danchuang',
              size: 16,
              onClick: withModifiers(this.onDisplayAsSwitch, ['stop'])
            }),
          this.showFullscreen &&
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

    const classNames = [mainClassName, `${mainClassName}-wrapper`, this.modalDrawerClassName];
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
    return createVNode(
      ADrawer,
      {
        ...PropRecordHelper.collectionBasicProps(
          this.$attrs,
          StringHelper.append(classNames, CastHelper.cast(this.wrapperClassName)),
          this.wrapperProps?.style
        ),
        placement: this.placement,
        width: StyleHelper.px(this.width),
        height: StyleHelper.px(this.height),
        mask: this.mask,
        maskClosable: this.maskClosable,
        zIndex: this.zIndex,
        visible: this.visible,
        closable: this.closable,
        keyboard: this.keyboard,
        destroyOnClose: this.destroyOnClose,
        getContainer: this.getTriggerContainer,
        onOk: this.enter,
        onClose: this.cancel
      },
      {
        ...slots,
        default: () => finalDefaultSlot
      }
    );
  }
});
</script>
