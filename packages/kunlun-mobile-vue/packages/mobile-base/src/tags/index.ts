import { vAutoHidden, vFocus } from '@oinone/kunlun-vue-ui-common';
import { componentInstall, directiveInstall, pluginInstall } from '@oinone/kunlun-vue-widget';
import { $translate } from '../plugins';
import Action from './Action.vue';
import ActionBar from './ActionBar.vue';
import ActionColumn from './ActionColumn.vue';
import Block from './Block.vue';
import Card from './Card.vue';
import CardCascader from './CardCascader.vue';
import Col from './Col.vue';
import Container from './Container.vue';
import Containers from './Containers.vue';
import Custom from './Custom.vue';
import DateRangePicker from './datetime/DateRangePicker.vue';
import DateTimeRangePicker from './datetime/DateTimeRangePicker.vue';
import TimeRangePicker from './datetime/TimeRangePicker.vue';
import YearRangePicker from './datetime/YearRangePicker.vue';
import Dropdown from './Dropdown.vue';
import Element from './Element.vue';
import Field from './Field.vue';
import Group from './Group.vue';
import Icon from './Icon.vue';
import Pack from './Pack.vue';
import Paragraph from './Paragraph.vue';
import Picture from './Picture.vue';
import Row from './Row.vue';
import Search from './Search.vue';
import Table from './Table.vue';
import { Tabs } from './tabs/index';
import TextInfo from './TextInfo.vue';
import Tree from './Tree.vue';
import { getViewTagMap, registerElementTag } from './util';
import View from './View.vue';

registerElementTag('gallery', undefined, ['gallery', 'Gallery']);

export function install() {
  componentInstall(View, 'oinone-view');
  componentInstall(Field);
  componentInstall(Action);
  componentInstall(Element);
  componentInstall(Pack);
  componentInstall(Custom);

  componentInstall(ActionBar, ['action-bar', 'ActionBar', 'actionBar']);
  componentInstall(ActionColumn, [
    'action-column',
    'ActionColumn',
    'actionColumn',
    'row-action',
    'RowAction',
    'rowAction',
    'row-actions',
    'RowActions',
    'rowActions'
  ]);
  componentInstall(Block);
  componentInstall(Card);
  componentInstall(CardCascader, ['card-cascader', 'CardCascader', 'cardCascader']);
  componentInstall(Col);
  componentInstall(Container);
  componentInstall(Containers);
  componentInstall(DateTimeRangePicker);
  componentInstall(DateRangePicker);
  componentInstall(TimeRangePicker);
  componentInstall(YearRangePicker);
  componentInstall(Dropdown, ['dropdown', 'toolbar-dropdown', 'ToolbarDropdown', 'toolbarDropdown']);
  componentInstall(Group, ['Group', 'Fieldset']);
  componentInstall(TextInfo);
  componentInstall(Paragraph);
  componentInstall(Picture);
  componentInstall(Icon);
  componentInstall(Row);
  componentInstall(Search);
  componentInstall(Table);
  componentInstall(Tree);

  componentInstall(Tabs, ['Tabs', 'MultiViewTabs']);

  const viewTagMap = getViewTagMap();
  viewTagMap.forEach((name, component) => {
    componentInstall(component, name);
  });

  directiveInstall(vAutoHidden, 'autoHidden');
  directiveInstall(vFocus, 'focus');

  pluginInstall($translate);
}

export {
  Action,
  ActionBar,
  ActionColumn,
  Card,
  Col,
  Container,
  Containers,
  Dropdown,
  Field,
  Group,
  Icon,
  Paragraph,
  Picture,
  Row,
  Search,
  Table,
  TextInfo,
  View
};

export * from './context';
export * from './mixin';
export * from './resolve';
export * from './tabs';
export * from './util';
