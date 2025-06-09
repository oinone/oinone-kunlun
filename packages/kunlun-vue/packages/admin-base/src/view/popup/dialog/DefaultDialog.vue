<script lang="ts">
import { ViewType } from '@oinone/kunlun-meta';
import { CastHelper, OioButton, OioModal, PropRecordHelper, StringHelper } from '@oinone/kunlun-vue-ui-antd';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { createVNode, defineComponent, PropType } from 'vue';
import { FooterProps, useFooter } from '../useFooter';
import { OioSimplePagination } from '../../../components';

export default defineComponent({
  name: 'DefaultDialog',
  components: {
    OioModal,
    OioButton,
    OioSimplePagination
  },
  inheritAttrs: false,
  props: {
    ...FooterProps,
    currentHandle: {
      type: String
    },
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
    draggable: {
      type: Boolean,
      default: undefined
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
    },
    // 是否显示切换全屏按钮
    showFullscreen: {
      type: Boolean,
      default: false
    },
    // 是否显示切换窗口类型按钮
    showDisplayAs: {
      type: Boolean,
      default: false
    },
    // 是否显示上一条、下一条数据切换
    showPreNextToggle: {
      type: Boolean,
      default: false
    },
    // 列表视图总页数
    listViewTotalPage: {
      type: Number,
      default: 0
    },
    // 列表视图当前行号
    listViewRowNumber: {
      type: Number,
      default: 1
    },
    onChangeRowNumber: {
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
      currentHandle,
      visible,
      onVisibleChange,
      destroyOnClose,
      teleport,
      title,
      mask,
      closable,
      help,
      draggable,
      width,
      height,
      zIndex,
      maskClosable,
      headerInvisible,
      footerInvisible,
      onOk,
      onCancel,
      viewType,
      showDisplayAs,
      showFullscreen,
      showPreNextToggle,
      listViewTotalPage,
      listViewRowNumber,
      onChangeRowNumber
    } = this;
    const children = PropRecordHelper.collectionSlots($slots, [
      { origin: 'default', isNotNull: true },
      'footer',
      'closeIcon'
    ]);
    if (!children.footer) {
      children.footer = () => [
        createVNode('div', { class: 'default-dialog-footer' }, useFooter(CastHelper.cast(this)))
      ];
    }

    if (showPreNextToggle) {
      /**
       * 上一条、下一条数据切换
       */
      const defaultFooterSlot = children.footer();
      children.footer = () => [
        createVNode(
          'div',
          {
            class: 'default-dialog-pre-next-switch-footer'
          },
          {
            default: () => [
              createVNode(OioSimplePagination, {
                total: listViewTotalPage,
                current: listViewRowNumber,
                onChange: onChangeRowNumber
              }),
              ...defaultFooterSlot
            ]
          }
        )
      ];
    }

    return createVNode(
      OioModal,
      {
        wrapperClassName: StringHelper.append(
          [`default-dialog default-dialog-${viewType?.toLowerCase()}`],
          this.wrapperClassName
        ),
        wrapperProps: {
          id: currentHandle
        },
        visible,
        getTriggerContainer: teleport,
        title,
        help,
        mask,
        closable,
        draggable,
        width,
        height,
        zIndex,
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
