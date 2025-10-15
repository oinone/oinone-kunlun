import { OioTooltip } from '@oinone/kunlun-vue-ui-antd';
import { createVNode, VNode } from 'vue';
import { VxeTableDefines } from 'vxe-table';
import VxeGlobalConfig from 'vxe-table/lib/v-x-e-table/src/conf';

export interface VxeCheckboxCellRenderBodyParams extends VxeTableDefines.CellRenderBodyParams {
  checked: boolean;
  indeterminate: boolean;
  visible: boolean;
  disabled: boolean;
  disabledTitle?: string;
}

/**
 * source: vxe-table/packages/table/src/cell.ts#renderCheckboxCell
 */
export function useVxeCheckboxCell(params: VxeCheckboxCellRenderBodyParams) {
  const { $table, isHidden, checked, disabled, disabledTitle, visible, indeterminate } = params;
  const checkVNs: VNode[] = [];
  const ons: Record<string, unknown> = {};
  if (!isHidden) {
    ons.onClick = (evnt: MouseEvent) => {
      if (!disabled && visible) {
        $table.triggerCheckRowEvent(evnt, params, !checked);
      }
    };
  }
  if (visible) {
    let icon = VxeGlobalConfig.icon.TABLE_CHECKBOX_UNCHECKED;
    if (indeterminate) {
      icon = VxeGlobalConfig.icon.TABLE_CHECKBOX_INDETERMINATE;
    } else if (checked) {
      icon = VxeGlobalConfig.icon.TABLE_CHECKBOX_CHECKED;
    }
    let checkboxIcon: VNode;
    const checkboxVNode = createVNode('span', { class: ['vxe-checkbox--icon', icon] });
    if (disabled) {
      if (disabledTitle) {
        checkboxIcon = createVNode(
          OioTooltip,
          {
            title: disabledTitle
          },
          {
            default: () => {
              return [checkboxVNode];
            }
          }
        );
      } else {
        checkboxIcon = checkboxVNode;
      }
    } else {
      checkboxIcon = checkboxVNode;
    }
    checkVNs.push(checkboxIcon);
  }
  return createVNode(
    'span',
    {
      class: [
        'vxe-cell--checkbox',
        {
          'is--checked': checked,
          'is--disabled': disabled,
          'is--indeterminate': indeterminate
        }
      ],
      ...ons
    },
    checkVNs
  );
}
