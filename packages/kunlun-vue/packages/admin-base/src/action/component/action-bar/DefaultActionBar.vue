<script lang="ts">
import { DownOutlined } from '@ant-design/icons-vue';
import { type ActiveRecord, translateValueByKey } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { uniqueKeyGenerator } from '@oinone/kunlun-shared';
import {
  ButtonBizStyle,
  ButtonType,
  IconPlacement,
  OioButton,
  OioCheckbox,
  OioDropdown,
  OioSwitch
} from '@oinone/kunlun-vue-ui-antd';
import { ListSelectMode, OioDropdownTrigger, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { type DslRenderDefinition, onAllMounted } from '@oinone/kunlun-vue-widget';
import { Menu as AMenu } from 'ant-design-vue';
import { isNil } from 'lodash-es';
import {
  computed,
  createVNode,
  defineComponent,
  type PropType,
  type VNode,
  vShow,
  withDirectives,
  withModifiers
} from 'vue';
import { ActiveCountEnum, type MoreActionRender, OperationColumnDirection } from '../../../typing';
import { CollectionActions } from '../../../util/collection-actions';
import { ActionBarBizStyle } from '../typing';
import DefaultMoreActionItem from './DefaultMoreActionItem.vue';

const actionBarClassName = 'action-bar';

const moreActionSelectorClassName = 'more-action-selector';

function createMoreAction(
  vnodes: VNode[],
  inline: boolean,
  options: {
    slotName?: string;
    rowIndex?: number;
    bizStyle?: string;
    buttonType?: string;
    operatorColumnDirection?: OperationColumnDirection;
    allMounted: Function | undefined;
    moreActionTriggers: OioDropdownTrigger[];
  }
): VNode | VNode[] {
  const classList = [moreActionSelectorClassName];
  let defaultButtonType = ButtonType.primary;
  let defaultBizStyle: ButtonBizStyle | undefined;
  if (inline) {
    classList.push(`${moreActionSelectorClassName}-inline`);
    defaultButtonType = ButtonType.link;
  } else if (options.bizStyle === ActionBarBizStyle.style2) {
    defaultButtonType = ButtonType.text;
    defaultBizStyle = ButtonBizStyle.default;
  }
  const { buttonType } = options;
  const triggerVNode = createVNode(
    OioButton,
    {
      class: classList,
      type: buttonType || defaultButtonType,
      bizStyle: defaultBizStyle,
      icon: 'oinone-menu-caidanxiala',
      iconPlacement: IconPlacement.AFTER,
      onClick: withModifiers(() => {}, ['prevent'])
    },
    {
      default: () => translateValueByKey('更多')
    }
  );
  const moreActionItems = vnodes.map((v) =>
    createVNode(DefaultMoreActionItem, {
      model: v.props?.model,
      name: v.props?.name,
      slotName: options.slotName,
      rowIndex: options.rowIndex
    })
  );
  return [
    createVNode('div', { class: 'more-action-invisible-render-wrapper' }, vnodes),
    createVNode(
      OioDropdown,
      {
        overlayClassName: 'default-dropdown-overlay',
        trigger: options.moreActionTriggers
      },
      {
        default: () => [triggerVNode],
        overlay: () =>
          createVNode(
            AMenu,
            { class: 'default-dropdown-menu' },
            {
              default: () => moreActionItems
            }
          )
      }
    )
  ];
}

export default defineComponent({
  name: 'DefaultActionBar',
  components: {
    DownOutlined
  },
  inheritAttrs: false,
  props: {
    currentHandle: {
      type: String
    },
    slotName: {
      type: String
    },
    template: {
      type: Object as PropType<DslRenderDefinition>
    },
    dataSource: {
      type: Array as PropType<ActiveRecord[]>
    },
    activeRecords: {
      type: Array as PropType<ActiveRecord[]>
    },
    rowIndex: {
      type: Number
    },
    viewType: {
      type: String as PropType<ViewType>
    },
    invisible: {
      type: Boolean,
      default: false
    },
    inline: {
      type: Boolean,
      default: false
    },
    bizStyle: {
      type: String
    },
    justify: {
      type: String
    },
    direction: {
      type: String
    },
    operatorColumnDirection: {
      type: String as PropType<OperationColumnDirection | keyof typeof OperationColumnDirection>
    },
    isFloat: {
      type: Boolean,
      default: false
    },
    activeCount: {
      type: Number
    },
    buttonType: {
      type: String
    },
    showActionNames: {
      type: Array as PropType<string[]>
    },
    allMounted: {
      type: Function
    },
    moreActionTriggers: {
      type: Array as PropType<OioDropdownTrigger[]>
    },
    moreActionRender: {
      type: Function as PropType<MoreActionRender>
    },
    selectMode: {
      type: String as PropType<ListSelectMode>
    },
    onSelectModeChange: {
      type: Function as PropType<(mode: ListSelectMode | undefined) => void>
    },
    onCheckboxAll: {
      type: Function as PropType<(selected: boolean) => void>
    }
  },
  setup(props) {
    onAllMounted({
      allMounted: () => {
        props.allMounted?.();
      },
      allMountedUpdate: () => {
        props.allMounted?.();
      }
    });

    const activeCount = computed(() => {
      let val = props.activeCount;
      if (isNil(val)) {
        val = props.inline ? ActiveCountEnum.THREE : ActiveCountEnum.FIVE;
      }
      return val;
    });

    const allowSelected = computed(() => {
      return props.selectMode === ListSelectMode.checkbox;
    });

    const checkboxAllState = computed(() => {
      const total = props.dataSource?.length || 0;
      const selectedCount = props.activeRecords?.length || 0;
      return {
        checked: total === selectedCount,
        indeterminate: selectedCount >= 1 && selectedCount < total,
        disabled: total === 0,
        count: selectedCount
      };
    });

    const updateValueAllowSelected = (val: boolean) => {
      if (val) {
        props.onSelectModeChange?.(ListSelectMode.checkbox);
      } else {
        props.onSelectModeChange?.(undefined);
      }
    };

    return {
      activeCount,
      allowSelected,
      checkboxAllState,
      updateValueAllowSelected
    };
  },
  render() {
    const classList = [actionBarClassName, 'oio-scrollbar'];
    if (this.inline) {
      classList.push(`${actionBarClassName}-inline`);
    }
    const operatorColumnDirection =
      this.operatorColumnDirection?.toLowerCase?.() || OperationColumnDirection.horizontal;
    const buttonType = this.buttonType?.toLowerCase?.() || ButtonType.link;
    classList.push(`${actionBarClassName}-${operatorColumnDirection}`);
    classList.push(`${actionBarClassName}-${buttonType}`);
    if (this.bizStyle) {
      classList.push(`${actionBarClassName}-${this.bizStyle}`);
    }
    const {
      default: defaultSlot,
      before: beforeSlot,
      after: afterSlot,
      left: leftSlot,
      right: rightSlot
    } = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default', isNotNull: true },
      'before',
      'after',
      'left',
      'right'
    ]);
    const collectionActions = new CollectionActions(this.showActionNames, this.activeCount);
    collectionActions.do(defaultSlot());
    const { hasMore, showActionFlags, moreActions, moreActionFlags, otherVNodes } = collectionActions;
    let { showActions } = collectionActions;
    if (
      hasMore &&
      showActionFlags[showActionFlags.length - 1] &&
      moreActions.length &&
      moreActionFlags.some((v) => v)
    ) {
      const originMoreAction = showActions[showActions.length - 1];
      let moreActionVNodes: VNode[] = [];
      const renderResult = (this.moreActionRender || createMoreAction)(moreActions, this.inline, {
        slotName: this.slotName,
        rowIndex: this.rowIndex,
        bizStyle: this.bizStyle,
        buttonType: this.buttonType,
        operatorColumnDirection: operatorColumnDirection as OperationColumnDirection,
        allMounted: this.allMounted,
        moreActionTriggers: this.moreActionTriggers || [OioDropdownTrigger.hover]
      });
      if (Array.isArray(renderResult)) {
        moreActionVNodes = renderResult;
      } else {
        moreActionVNodes = [renderResult];
      }
      showActions.push(
        createVNode(
          'div',
          {
            key: originMoreAction.props?.dslDefinition?.name || uniqueKeyGenerator(),
            class: 'more-action-item'
          },
          [...otherVNodes, ...moreActionVNodes]
        )
      );
    } else {
      showActions = [...showActions, ...otherVNodes, ...moreActions];
    }
    // fixme @zbh 20221102 使用SPI注册
    if (this.viewType === ViewType.Gallery && !this.inline) {
      showActions.push(
        createVNode(
          'div',
          {
            class: 'gallery-action-bar-operators'
          },
          [
            createVNode('div', { class: 'gallery-action-bar-batch-selected' }, [
              createVNode(OioSwitch, {
                checked: this.allowSelected,
                'onUpdate:checked': this.updateValueAllowSelected
              }),
              createVNode('span', {}, translateValueByKey('批量管理'))
            ]),
            withDirectives(
              createVNode(
                OioCheckbox,
                {
                  checked: this.checkboxAllState.checked,
                  indeterminate: this.checkboxAllState.indeterminate,
                  disabled: this.checkboxAllState.disabled,
                  'onUpdate:checked': this.onCheckboxAll
                },
                {
                  default: () => `${translateValueByKey('全选')} (${this.checkboxAllState.count})`
                }
              ),
              [[vShow, this.allowSelected]]
            )
          ]
        )
      );
    }
    if (this.direction) {
      classList.push(`${actionBarClassName}-direction-${this.direction}`);
    }
    if (this.justify) {
      classList.push(`${actionBarClassName}-${this.justify}`);
    }
    if (this.isFloat) {
      classList.push(`${actionBarClassName}-float`);
    }
    const beforeVNodes = beforeSlot?.();
    const afterVNodes = afterSlot?.();
    const actionVNodes = [...(beforeVNodes || []), ...showActions, ...(afterVNodes || [])];

    const leftVNodes = leftSlot?.();
    const rightVNodes = rightSlot?.();
    let actionBarContentVNodes: VNode[] = [];
    if (leftVNodes?.length) {
      actionBarContentVNodes.push(
        createVNode('div', { class: `${actionBarClassName}-left oio-scrollbar` }, leftVNodes || [])
      );
      if (rightVNodes?.length) {
        classList.push(`${actionBarClassName}-between`);
        actionBarContentVNodes.push(
          createVNode('div', { class: `${actionBarClassName}-center oio-scrollbar` }, actionVNodes)
        );
        actionBarContentVNodes.push(
          createVNode('div', { class: `${actionBarClassName}-right oio-scrollbar` }, rightVNodes || [])
        );
      } else {
        classList.push(`${actionBarClassName}-between`);
        actionBarContentVNodes.push(
          createVNode('div', { class: `${actionBarClassName}-right oio-scrollbar` }, actionVNodes)
        );
      }
    } else if (rightVNodes?.length) {
      classList.push(`${actionBarClassName}-between`);
      actionBarContentVNodes.push(
        createVNode('div', { class: `${actionBarClassName}-left oio-scrollbar` }, actionVNodes)
      );
      actionBarContentVNodes.push(
        createVNode('div', { class: `${actionBarClassName}-right oio-scrollbar` }, rightVNodes || [])
      );
    } else {
      classList.push(`${actionBarClassName}-flatten`);
      actionBarContentVNodes = actionVNodes;
    }
    return withDirectives(
      createVNode('div', PropRecordHelper.collectionBasicProps(this.$attrs, classList), actionBarContentVNodes),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
