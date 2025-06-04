<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { OioCloseIcon, OioDrawerProps, PropRecordHelper, StyleHelper, useDrawer } from '@oinone/kunlun-vue-ui-common';
import { Drawer as ADrawer } from 'ant-design-vue';
import { isBoolean } from 'lodash-es';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioButton } from '../oio-button';
import { OioSpin } from '../oio-spin';
import { OioTooltipHelp } from '../oio-tooltip';

export default defineComponent({
  name: 'OioDrawer',
  components: {
    ADrawer,
    OioButton,
    OioSpin
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
      let titleSlot = slots.title;
      if (!titleSlot) {
        titleSlot = () => [createVNode('span', {}, this.title || OioDrawerProps.title.default)];
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

    const classNames = [mainClassName, `${mainClassName}-wrapper`];
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
