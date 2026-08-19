import { translateValueByKey } from '@oinone/kunlun-engine';
import {
  ButtonBizStyle,
  ButtonType,
  IconPlacement,
  OioButton,
  OioDropdown,
  OioTooltip
} from '@oinone/kunlun-vue-ui-antd';
import { OioDropdownTrigger } from '@oinone/kunlun-vue-ui-common';
import { Menu as AMenu } from 'ant-design-vue';
import type { ActionWidget } from 'packages/oinone-kunlun/packages/kunlun-vue/packages/admin-base/src/action/component/action';
import { createVNode, type VNode, withModifiers } from 'vue';
import { OperationColumnDirection } from '../../../typing';
import { ActionBarBizStyle } from '../typing';
import DefaultMoreActionItem from './DefaultMoreActionItem.vue';

const moreActionSelectorClassName = 'more-action-selector';

export function createMoreAction(
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

export function createButtonToolip(actionProps: ActionWidget['actionProps'], btn: VNode) {
  return createVNode(
    OioTooltip,
    {},
    {
      default: () => [btn],
      title: () => {
        if (typeof actionProps.tooltip === 'string') {
          return [createVNode('span', { innerHTML: actionProps.tooltip })];
        }
        if (Array.isArray(actionProps.tooltip)) {
          return actionProps.tooltip;
        }
        return [actionProps.tooltip];
      }
    }
  );
}
