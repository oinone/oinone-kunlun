<script lang="ts">
import { CastHelper, OioButton, OioDrawer, PropRecordHelper, StringHelper } from '@kunlun/vue-ui-antd';
import { onAllMounted } from '@kunlun/vue-widget';
import { createVNode, defineComponent, PropType } from 'vue';
import { FooterProps, useFooter } from '../useFooter';
import { ViewType } from '@kunlun/meta';

export default defineComponent({
  components: {
    OioDrawer,
    OioButton
  },
  props: {
    ...FooterProps,
    visible: {
      type: Boolean,
      default: undefined
    },
    onVisibleChange: {
      type: Function as PropType<(visible: boolean) => void>
    },
    destroyOnClose: {
      type: Boolean,
      default: undefined
    },
    teleport: {
      type: Function as PropType<() => HTMLElement>
    },
    title: {
      type: String
    },
    help: {
      type: String
    },
    wrapperClassName: {
      type: String
    },
    width: {
      type: [Number, String]
    },
    height: {
      type: [Number, String]
    },
    zIndex: {
      type: Number
    },
    placement: {
      type: String,
      default: undefined
    },
    mask: {
      type: Boolean,
      default: true
    },
    closable: {
      type: Boolean,
      default: true
    },
    maskClosable: {
      type: Boolean,
      default: undefined
    },
    headerInvisible: {
      type: Boolean,
      default: undefined
    },
    footerInvisible: {
      type: Boolean,
      default: undefined
    },
    viewType: {
      type: String as PropType<ViewType>
    },
    allMounted: {
      type: Function
    }
  },
  setup(props) {
    onAllMounted(() => {
      props.allMounted?.();
    });

    return {};
  },
  render() {
    const {
      $slots,
      visible,
      onVisibleChange,
      destroyOnClose,
      teleport,
      title,
      help,
      width,
      height,
      mask,
      closable,
      zIndex,
      placement,
      maskClosable,
      headerInvisible,
      footerInvisible,
      onOk,
      onCancel,
      viewType
    } = this;
    const children = PropRecordHelper.collectionSlots($slots, [
      { origin: 'default', isNotNull: true },
      'footer',
      'closeIcon'
    ]);

    if (!children.footer) {
      children.footer = () => [
        createVNode('div', { class: 'default-drawer-footer' }, useFooter(CastHelper.cast(this)))
      ];
    }

    return createVNode(
      OioDrawer,
      {
        wrapperClassName: StringHelper.append(
          [`default-drawer default-drawer-${viewType?.toLowerCase()}`],
          this.wrapperClassName
        ),
        visible,
        getTriggerContainer: teleport,
        title,
        help,
        width,
        height,
        mask,
        closable,
        zIndex,
        placement,
        maskClosable,
        headerInvisible,
        footerInvisible,
        destroyOnClose,
        enterCallback: onOk,
        cancelCallback: onCancel,
        'onUpdate:visible': onVisibleChange
      },
      children
    );
  }
});
</script>
