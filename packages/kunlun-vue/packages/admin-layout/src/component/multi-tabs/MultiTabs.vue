<script lang="ts">
import { MultiTabsRuntimeManifestMergedConfigManager, MultiTabType, translateValueByKey } from '@oinone/kunlun-engine';
import { DraggableDirection, DraggableMovedEvent, DraggableSendEvent, OioDraggable } from '@oinone/kunlun-vue-ui';
import {
  ButtonType,
  DividerType,
  IconTypeEnum,
  OioButton,
  OioDivider,
  OioDropdown,
  OioDropdownTrigger,
  OioIcon,
  useScrollOperator
} from '@oinone/kunlun-vue-ui-antd';
import { Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import { debounce, isFunction, isNil } from 'lodash-es';
import {
  computed,
  createVNode,
  defineComponent,
  nextTick,
  PropType,
  VNode,
  vShow,
  watch,
  withDirectives,
  withModifiers
} from 'vue';
import { DEFAULT_APPLICATION_LOGO } from '../../typing';
import { MultiTabItem } from './typing';

type ClickTabFunction = (tab: MultiTabItem) => void;

type ClosableFunction = (tabs: MultiTabItem[], tab: MultiTabItem, index: number) => boolean;

type DisabledFunction = (tabs: MultiTabItem[], index: number) => boolean;

interface ToolbarItem {
  key: string;
  title: string;
  disabled: DisabledFunction;
}

const tabsContainerId = 'k-layout-multi-tabs';

function generatorTabId(index: number) {
  return `${tabsContainerId}-tab-${index}`;
}

const draggableIgnoredClassName = 'k-layout-multi-tabs-draggable-ignored';

const draggableFilter = `.${draggableIgnoredClassName}`;

export default defineComponent({
  name: 'MultiTabs',
  components: {
    OioButton,
    OioDraggable,
    OioDropdown,
    OioDivider,
    AMenu,
    AMenuItem
  },
  inheritAttrs: false,
  props: {
    tabs: {
      type: Array as PropType<MultiTabItem[]>
    },
    homepageType: {
      type: Number as PropType<MultiTabType>
    },
    inline: {
      type: Boolean,
      default: undefined
    },
    showModuleLogo: {
      type: Boolean,
      default: undefined
    },
    draggable: {
      type: Boolean,
      default: undefined
    },
    activeKey: {
      type: String
    },
    invisible: {
      type: Boolean,
      default: undefined
    },
    tabThemeClass: {
      type: String,
      default: ''
    },
    closable: {
      type: [Boolean, Function] as PropType<boolean | ClosableFunction>
    },
    onClickTab: {
      type: Function as PropType<ClickTabFunction>
    },
    onRefreshTab: {
      type: Function as PropType<ClickTabFunction>
    },
    onCloseTab: {
      type: Function as PropType<ClickTabFunction>
    },
    onCloseOtherTabs: {
      type: Function as PropType<ClickTabFunction>
    },
    onCloseLeftTabs: {
      type: Function as PropType<ClickTabFunction>
    },
    onCloseRightTabs: {
      type: Function as PropType<ClickTabFunction>
    },
    onOpenNewWindow: {
      type: Function as PropType<ClickTabFunction>
    },
    onMoveToSelfCallback: {
      type: Function as PropType<(dragTab: MultiTabItem, target: MultiTabItem) => boolean>
    },
    onMovedCallback: {
      type: Function as PropType<ClickTabFunction>
    }
  },
  setup(props) {
    const ToolbarItems: ToolbarItem[] = [
      {
        key: 'onRefreshTab',
        title: translateValueByKey('刷新当前标签页'),
        disabled: () => {
          return false;
        }
      },
      {
        key: 'onOpenNewWindow',
        title: translateValueByKey('新窗口打开'),
        disabled: () => {
          return false;
        }
      },
      {
        key: 'onCloseTab',
        title: translateValueByKey('关闭当前'),
        disabled: (tabs, index) => {
          if (
            MultiTabsRuntimeManifestMergedConfigManager.isEnabledHomepage() ||
            MultiTabsRuntimeManifestMergedConfigManager.isEnabledModuleHomepage()
          ) {
            return tabs.length === 1 || index === 0;
          }
          return tabs.length === 1;
        }
      },
      {
        key: 'onCloseOtherTabs',
        title: translateValueByKey('关闭其他'),
        disabled: (tabs) => {
          if (
            MultiTabsRuntimeManifestMergedConfigManager.isEnabledHomepage() ||
            MultiTabsRuntimeManifestMergedConfigManager.isEnabledModuleHomepage()
          ) {
            return tabs.length <= 2;
          }
          return tabs.length <= 1;
        }
      },
      {
        key: 'onCloseLeftTabs',
        title: translateValueByKey('关闭左侧'),
        disabled: (tabs, index) => {
          if (
            MultiTabsRuntimeManifestMergedConfigManager.isEnabledHomepage() ||
            MultiTabsRuntimeManifestMergedConfigManager.isEnabledModuleHomepage()
          ) {
            return index <= 1;
          }
          return index === 0;
        }
      },
      {
        key: 'onCloseRightTabs',
        title: translateValueByKey('关闭右侧'),
        disabled: (tabs, index) => {
          return index === tabs.length - 1;
        }
      }
    ];

    const activeTab = computed<{ tab: MultiTabItem; index: number } | undefined>(() => {
      const activeKey = props.activeKey;
      if (!activeKey) {
        return undefined;
      }
      const tabs = props.tabs || [];
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        if (tab.key === activeKey) {
          return {
            tab,
            index: i
          };
        }
      }
      return undefined;
    });

    const closableFunction = computed<ClosableFunction>(() => {
      let fn: ClosableFunction | undefined;
      if (isNil(props.closable)) {
        fn = () => false;
      } else if (isFunction(props.closable)) {
        fn = props.closable;
      } else {
        fn = () => props.closable as boolean;
      }
      return fn;
    });

    const computeToolbarItemDisabled = (item: ToolbarItem) => {
      return !props.tabs || !activeTab.value || item.disabled(props.tabs, activeTab.value.index);
    };

    const onClickContextMenu = (key: string) => {
      const item = ToolbarItems.find((v) => v.key === key);
      if (!item) {
        console.error('Invalid toolbar item key.');
        return;
      }
      const clickTabFunction = props[item.key] as ClickTabFunction;
      if (!clickTabFunction) {
        console.error('Invalid click tab function.');
        return;
      }
      if (computeToolbarItemDisabled(item)) {
        return;
      }
      clickTabFunction(activeTab.value!.tab);
    };

    const moveToSelfCallback = (sendEvent: DraggableSendEvent<MultiTabItem>) => {
      if (props.onMoveToSelfCallback) {
        const dragTab = sendEvent.draggedContext.element;
        const target = sendEvent.relatedContext.element;
        if (dragTab && target) {
          return props.onMoveToSelfCallback(dragTab, target);
        }
        return false;
      }
      return true;
    };

    const movedCallback = (moved: DraggableMovedEvent<MultiTabItem>) => {
      props.onMovedCallback?.(moved.element);
    };

    const scrollIntoViewTab = debounce((index: number) => {
      nextTick(() => {
        const tabsContainerDom = document.getElementById(tabsContainerId);
        const tabDom = document.getElementById(generatorTabId(index));
        if (!tabsContainerDom || !tabDom) {
          return;
        }
        useScrollOperator(tabsContainerDom, tabDom, { offset: 4 }).horizontal.updateScroll();
      });
    }, 80);

    watch(activeTab, (val) => {
      if (!val) {
        return;
      }
      scrollIntoViewTab(val.index);
    });

    return {
      activeTab,
      closableFunction,
      ToolbarItems,

      computeToolbarItemDisabled,
      onClickContextMenu,

      moveToSelfCallback,
      movedCallback
    };
  },
  render() {
    const {
      tabs,
      homepageType,
      inline,
      showModuleLogo,
      draggable,
      activeKey,
      invisible,
      ToolbarItems,
      tabThemeClass,

      closableFunction,

      computeToolbarItemDisabled,
      onClickContextMenu,

      moveToSelfCallback,
      movedCallback
    } = this;
    if (!tabs?.length) {
      return [];
    }

    const createTabVNode = (tab: MultiTabItem, index: number): VNode => {
      const { key, title } = tab;
      const allowClosable = closableFunction(tabs, tab, index);
      const isActive = key === activeKey;

      const tabChildren: VNode[] = [];
      const tabType = tab.instance.type;
      const classNames = [
        'k-layout-multi-tabs-tab',
        allowClosable && 'k-layout-multi-tabs-tab-closable',
        isActive && 'k-layout-multi-tabs-tab-active'
      ];

      if (tabType === homepageType) {
        classNames.push(draggableIgnoredClassName);
        tabChildren.push(
          createVNode('div', { class: 'k-layout-multi-tabs-homepage-icon' }, [
            createVNode(OioIcon, { icon: 'oinone-shouye1', color: 'var(--oio-primary-color)', size: '16px' })
          ])
        );
      } else if (showModuleLogo) {
        const { logoIcon, logoUrl } = tab.instance;
        if (logoIcon) {
          tabChildren.push(
            createVNode('div', { class: 'k-layout-multi-tabs-application-icon' }, [
              createVNode(OioIcon, { icon: logoIcon, color: 'var(--oio-primary-color)', size: '16px' })
            ])
          );
        } else {
          tabChildren.push(
            createVNode('div', { class: 'k-layout-multi-tabs-application-logo' }, [
              createVNode('img', { src: logoUrl || DEFAULT_APPLICATION_LOGO() })
            ])
          );
        }
      }
      tabChildren.push(
        createVNode(
          'div',
          {
            class: 'k-layout-multi-tabs-tab-title',
            title
          },
          title
        )
      );
      tabChildren.push(
        createVNode('div', { class: ['k-layout-multi-tabs-tab-close-btn'] }, [
          createVNode(
            OioButton,
            {
              type: ButtonType.link,
              onClick: withModifiers(() => {
                this.onCloseTab?.(tab);
              }, ['stop', 'prevent'])
            },
            {
              default: () => {
                return [createVNode(OioIcon, { type: IconTypeEnum.unicode, icon: '&#xe7e2;', size: '16px' })];
              }
            }
          )
        ])
      );
      if (index !== tabs.length - 1) {
        tabChildren.push(createVNode(OioDivider, { type: DividerType.vertical }));
      }
      return createVNode(
        'div',
        {
          id: generatorTabId(index),
          class: classNames,
          onClick: () => {
            this.onClickTab?.(tab);
          }
        },
        tabChildren
      );
    };
    const tabsVNode = createVNode(
      OioDraggable,
      {
        id: tabsContainerId,
        class: 'k-layout-multi-tabs oio-scrollbar',
        itemKey: 'key',
        group: 'layout-multi-tabs',
        list: tabs,
        direction: DraggableDirection.HORIZONTAL,
        swapThreshold: 0.6,
        draggableFilter,
        disabled: !draggable,
        moveToSelfCallback,
        movedCallback
      },
      {
        item: ({ element, index }) => {
          return createTabVNode(element, index);
        }
      }
    );
    const toolbarVNode = createVNode('div', { class: 'k-layout-multi-tabs-toolbar' }, [
      createVNode(
        OioDropdown,
        {
          trigger: [OioDropdownTrigger.click, OioDropdownTrigger.hover],
          overlayClassName: 'k-layout-multi-tabs-toolbar-overlay'
        },
        {
          default: () => {
            return [createVNode(OioIcon, { icon: 'oinone-xiala2', size: '16px' })];
          },
          overlay: () => {
            return createVNode(
              AMenu,
              {
                onClick: ({ key }) => {
                  onClickContextMenu(key);
                }
              },
              {
                default: () => {
                  const children = [] as VNode[];
                  for (const item of ToolbarItems) {
                    children.push(
                      createVNode(
                        AMenuItem,
                        {
                          key: item.key,
                          disabled: computeToolbarItemDisabled(item)
                        },
                        {
                          default: () => item.title
                        }
                      )
                    );
                  }
                  return children;
                }
              }
            );
          }
        }
      )
    ]);
    const classNames = ['k-layout-multi-tabs-wrapper'];

    if (tabThemeClass) {
      classNames.push(`k-layout-multi-tabs-wrapper-${tabThemeClass}`);
    }
    if (inline) {
      classNames.push('k-layout-multi-tabs-wrapper-inline');
    }
    return withDirectives(
      createVNode(
        'div',
        {
          class: classNames
        },
        [tabsVNode, toolbarVNode]
      ),
      [[vShow, !invisible]]
    );
  }
});
</script>
