import { VNode } from 'vue';
import { OperationColumnDirection } from './operation-column';
import { UserTablePrefer } from './user-prefer';
import { OioDropdownTrigger } from '@oinone/kunlun-vue-ui-common';

export interface VisibleField {
  displayName?: string;
  data: string;
  checked?: boolean;
}

export interface OperateEntity {
  visibleFields?: VisibleField[];
  prefer?: UserTablePrefer;
  inline?: boolean;
}

export type MoreActionRender = (
  vnodes: VNode[],
  inline: boolean,
  options: {
    allMounted: Function | undefined;
    buttonType?: string;
    operatorColumnDirection?: OperationColumnDirection;
    moreActionTriggers: OioDropdownTrigger[];
  }
) => VNode;
