import { OioTooltip } from '@oinone/kunlun-vue-ui-antd';
import { createVNode, VNode } from 'vue';
import type { SlotVNodeType, VxeTableDefines } from 'vxe-table';
import VxeGlobalConfig from 'vxe-table/es/v-x-e-table/src/conf.js';
import XEUtils from 'xe-utils';

export interface VxeCheckboxCellRenderBodyParams extends VxeTableDefines.CellRenderBodyParams {
  checked: boolean;
  indeterminate: boolean;
  visible: boolean;
  disabled: boolean;
  disabledTitle?: string;
}

function createCheckboxVNode(params: {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  disabledTitle?: string;
}) {
  const { checked, indeterminate, disabled, disabledTitle } = params;
  let icon = VxeGlobalConfig.icon.TABLE_CHECKBOX_UNCHECKED;
  if (indeterminate) {
    icon = VxeGlobalConfig.icon.TABLE_CHECKBOX_INDETERMINATE;
  } else if (checked) {
    icon = VxeGlobalConfig.icon.TABLE_CHECKBOX_CHECKED;
  }
  let checkboxVNode: VNode;
  const checkboxIcon = createVNode('span', { class: ['vxe-checkbox--icon', icon] });
  if (disabled) {
    if (disabledTitle) {
      checkboxVNode = createVNode(
        OioTooltip,
        {
          title: disabledTitle
        },
        {
          default: () => {
            return [checkboxIcon];
          }
        }
      );
    } else {
      checkboxVNode = checkboxIcon;
    }
  } else {
    checkboxVNode = checkboxIcon;
  }
  return checkboxVNode;
}

/**
 * source: vxe-table/packages/table/src/cell.ts#renderCheckboxCell
 */
export function useVxeCheckboxCell(params: VxeCheckboxCellRenderBodyParams) {
  const { $table, row, column, isHidden, checked, disabled, disabledTitle, visible, indeterminate } = params;
  const ons: Record<string, unknown> = {};
  if (!isHidden) {
    ons.onClick = (evnt: MouseEvent) => {
      if (!disabled && visible) {
        $table.triggerCheckRowEvent(evnt, params, !checked);
      }
    };
  }
  const checkVNs: VNode[] = [];
  if (visible) {
    checkVNs.push(createCheckboxVNode(params));
  }
  const { computeCheckboxOpts } = $table.getComputeMaps();
  const checkboxOpts = computeCheckboxOpts.value;
  const { labelField } = checkboxOpts;
  const { slots } = column;
  const defaultSlot = slots ? slots.default : null;
  let labelVNode: SlotVNodeType[] | string | undefined;
  if (defaultSlot) {
    labelVNode = $table.callSlot(defaultSlot, params);
  } else if (labelField) {
    labelVNode = XEUtils.get(row, labelField as string);
  }
  if (labelVNode) {
    checkVNs.push(createVNode('span', { class: 'vxe-checkbox--label' }, labelVNode));
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

export interface VxeCheckboxHeaderRenderBodyParams extends VxeTableDefines.CellRenderHeaderParams {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  disabledTitle?: string;
}

/**
 * source: vxe-table/packages/table/src/cell.ts#renderCheckboxHeader
 */
export function useVxeCheckboxHeader(params: VxeCheckboxHeaderRenderBodyParams) {
  const { $table, column, isHidden, checked, disabled, indeterminate } = params;
  const ons: Record<string, unknown> = {};
  if (!isHidden) {
    ons.onClick = (evnt: MouseEvent) => {
      if (!disabled) {
        $table.triggerCheckAllEvent(evnt, !checked);
      }
    };
  }
  const checkVNs: VNode[] = [createCheckboxVNode(params)];
  const { slots } = column;
  const titleSlot = slots ? slots.title : null;
  const headerTitle = column.getTitle();
  let labelVNode: SlotVNodeType[] | string | undefined;
  if (titleSlot) {
    labelVNode = $table.callSlot(titleSlot, params);
  } else if (headerTitle) {
    labelVNode = headerTitle;
  }
  if (labelVNode) {
    checkVNs.push(createVNode('span', { class: 'vxe-checkbox--label' }, labelVNode));
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
      title: VxeGlobalConfig.i18n('vxe.table.allTitle'),
      ...ons
    },
    checkVNs
  );
}
