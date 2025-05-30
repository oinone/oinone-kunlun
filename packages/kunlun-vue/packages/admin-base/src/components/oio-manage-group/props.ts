import { Ref, PropType } from 'vue';

export type IconGroupCommon = {
  id: string;
  sys?: boolean;
  name: string;
  libId?: string;
  iconNum?: string;
};

export interface GroupListItem extends IconGroupCommon {
  id: string;
  sys?: boolean;
  displayName?: string;
  name: string;
  itemNum?: string;
  refEditing?: Ref<boolean>;
  refName?: Ref<string>;
}

export const OioManageGroupProps = {
  widgetGroup: {
    type: Object
  },
  currentGroup: {
    type: Object as PropType<GroupListItem>
  },
  groupList: {
    type: Array as PropType<GroupListItem[]>
  },
  queryGroupList: {
    type: Function
  },
  onChangeWidgetGroup: {
    type: Function
  },
  onDeleteGroup: {
    type: Function
  },
  onCreateGroup: {
    type: Function
  },
  onModifyGroup: {
    type: Function
  },
  showOptButtons: {
    type: Boolean,
    default: true
  },
  // 在界面设计器选择图标中，下拉展开触发
  isShowed: {
    type: Boolean,
    default: true
  },
  // 是否开启宽度自适应
  enableAdaptiveWidtth: {
    type: Boolean,
    default: true
  },
  // 每行最后一个分组开启宽度自适应
  adaptiveWidth: {
    type: Number,
    default: 60
  },
  // 是否展示系统、分组元素数量
  showDetail: {
    type: Boolean,
    default: true
  }
};
