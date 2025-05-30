import { IMenu } from '@kunlun/meta';
import { Router } from '@kunlun/router';
import { SPI } from '@kunlun/spi';
import { MaskWidget } from '@kunlun/vue-admin-layout';
import { Widget } from '@kunlun/vue-widget';
import MenuComponent from './Menu.vue';

interface IResolvedMenu {
  menu: IMenu;
  children: IResolvedMenu[];
}

@SPI.ClassFactory(MaskWidget.Token({ widget: 'nav-menu' }))
export default class MenuWidget extends MaskWidget {
  @Widget.Reactive()
  private menus: IResolvedMenu[] = [];

  @Widget.Reactive()
  private menuArray: IMenu[] = [];

  @Widget.Reactive()
  private collapsed = false;

  @Widget.Inject('mode')
  @Widget.Reactive()
  private mode: 'horizontal' | 'inline' = 'inline';

  private resolvedMenus: Map<string, IResolvedMenu> = new Map();

  private router!: Router;

  private matchedInstance!: any;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(MenuComponent);
    return this;
  }

  public async mounted() {}

  @Widget.Method()
  private onChangeCollapsed(collapsed: boolean) {
    this.collapsed = collapsed;
  }

  private resolveMenu(menu: IMenu & { resolved?: boolean }): IResolvedMenu {
    if (menu.resolved) {
      return this.resolvedMenus.get(menu.id)!;
    }

    if (!menu.parent) {
      const resolved: IResolvedMenu = { menu, children: [] };
      this.resolvedMenus.set(menu.id, resolved);
      this.menus.push(resolved);
      menu.resolved = true;
      return resolved;
    }

    const resolved: IResolvedMenu = { menu, children: [] };
    menu.resolved = true;
    this.resolvedMenus.set(menu.id, resolved);

    const parentId = menu.parent.id;
    const parent = this.menuArray.find((m) => m.id === parentId)!;
    if (parent) {
      const resolvedParent = this.resolveMenu(parent)!;
      resolvedParent.children.push(resolved);
    }
    return resolved;
  }

  @Widget.Method()
  private onClick(menuId: string) {}

  @Widget.Reactive()
  private selectKeys: string[] = [];

  @Widget.Reactive()
  private openKeys: string[] = [];

  @Widget.Method()
  private openChange(openKeys: string[]) {
    const latestOpenKey = openKeys.find((key) => this.openKeys.indexOf(key) === -1);
    if (this.rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      this.openKeys = openKeys;
    } else {
      this.openKeys = latestOpenKey ? [latestOpenKey] : [];
    }
  }

  private get rootSubmenuKeys() {
    return this.menus.map((m) => m.menu.id);
  }
}
