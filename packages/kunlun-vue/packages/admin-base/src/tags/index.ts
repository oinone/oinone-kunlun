import { vAutoHidden, vFocus } from '@kunlun/vue-ui-common';
import { componentInstall, directiveInstall, pluginInstall } from '@kunlun/vue-widget';
import { $translate } from '../plugins';
import Action from './Action.vue';
import ActionBar from './ActionBar.vue';
import ActionColumn from './ActionColumn.vue';
import Col from './Col.vue';
import { PackCombination, Tabs } from './combination';
import Container from './Container.vue';
import Containers from './Containers.vue';
import Custom from './Custom.vue';
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
import TextInfo from './TextInfo.vue';
import Tree from './Tree.vue';
import { getViewTagMap } from './util';
import View from './View.vue';

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
  componentInstall(Col);
  componentInstall(Container);
  componentInstall(Containers);
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

  componentInstall(PackCombination, ['Tabs', 'MultiViewTabs', 'Collapse']);

  const viewTagMap = getViewTagMap();
  viewTagMap.forEach((name, component) => {
    componentInstall(component, name);
  });

  directiveInstall(vAutoHidden, 'autoHidden');
  directiveInstall(vFocus, 'focus');

  pluginInstall($translate);
}

export {
  View,
  Field,
  Action,
  Element,
  Pack,
  Custom,
  ActionBar,
  ActionColumn,
  Col,
  Container,
  Containers,
  Dropdown,
  Group,
  Icon,
  Paragraph,
  Picture,
  Row,
  Search,
  Table,
  TextInfo,
  Tree,
  Tabs
};

export * from './combination';
export * from './context';
export * from './mixin';
export * from './resolve';
export * from './util';
