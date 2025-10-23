<script lang="ts">
import { ViewType } from '@oinone/kunlun-meta';
import { CastHelper, OioButton, OioDrawer, PropRecordHelper, StringHelper } from '@oinone/kunlun-vue-ui-antd';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { createVNode, defineComponent, PropType } from 'vue';
import { useInjectOioDefaultFormContext, useProviderOioDefaultFormContext } from '../../../basic';
import { OioSimplePagination } from '../../../components';
import { FooterProps, useFooter } from '../useFooter';

export default defineComponent({
  components: {
    OioDrawer,
    OioButton,
    OioSimplePagination
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
    },
    // 是否显示切换全屏按钮
    enabledFullScreen: {
      type: Boolean,
      default: false
    },
    // 是否显示切换窗口类型按钮
    showPopupToggle: {
      type: Boolean,
      default: false
    },
    // 是否显示上一条、下一条数据切换
    showQuickToggle: {
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
    const formContext = useInjectOioDefaultFormContext();

    onAllMounted(() => {
      props.allMounted?.();
    });

    useProviderOioDefaultFormContext({
      ...formContext,
      getTriggerContainer() {
        return document.body;
      }
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
      viewType,
      enabledFullScreen,
      showPopupToggle,
      showQuickToggle,
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
        createVNode('div', { class: 'default-drawer-footer' }, useFooter(CastHelper.cast(this)))
      ];
    }

    if (showQuickToggle) {
      /**
       * 上一条、下一条数据切换
       */
      const defaultFooterSlot = children.footer();
      children.footer = () => [
        createVNode(
          'div',
          {
            class: 'default-drawer-pre-next-switch-footer'
          },
          {
            default: () => [
              createVNode(OioSimplePagination, {
                total: listViewTotalPage,
                current: listViewRowNumber,
                pageSize: 1,
                onChange: onChangeRowNumber
              }),
              ...defaultFooterSlot
            ]
          }
        )
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
        enabledFullScreen,
        showPopupToggle,
        enterCallback: onOk,
        cancelCallback: onCancel,
        'onUpdate:visible': onVisibleChange
      },
      children
    );
  }
});
</script>
