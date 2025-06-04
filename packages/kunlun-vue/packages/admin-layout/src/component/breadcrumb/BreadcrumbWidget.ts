import {
  BreadcrumbConfigManager,
  executeViewAction,
  generatorViewActionQueryParameter,
  ReloadMaskCallChainingParameters,
  RuntimeViewAction,
  ViewActionCache
} from '@oinone/kunlun-engine';
import { Matched, Router, useMatched } from '@oinone/kunlun-router';
import { BooleanHelper, Optional, TreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { useRouter } from '@oinone/kunlun-vue-router';
import { Widget } from '@oinone/kunlun-vue-widget';
import { MaskWidget } from '../../basic';
import { MenuService, ModuleService } from '../../service';
import { MenuUrlParameters, RuntimeMenu } from '../../typing';
import DefaultBreadcrumb from './DefaultBreadcrumb.vue';

@SPI.ClassFactory(
  MaskWidget.Token({
    dslNodeType: 'breadcrumb'
  })
)
export class BreadcrumbWidget extends MaskWidget {
  protected router!: Router;

  protected matched!: Matched;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultBreadcrumb);
    return this;
  }

  @Widget.Reactive()
  protected moduleName: string | undefined;

  @Widget.Reactive()
  protected menuNodes: TreeNode<RuntimeMenu>[] = [];

  @Widget.Reactive()
  protected currentViewTitle: string | undefined;

  @Widget.Reactive()
  protected items: RuntimeMenu[] = [];

  @Widget.Method()
  public executeAction(action: RuntimeViewAction) {
    executeViewAction(action, this.router, useMatched().matched, {
      id: '',
      context: '',
      searchBody: '',
      searchConditions: ''
    });
  }

  @Widget.Reactive()
  protected get enabledHomepage() {
    return Optional.ofNullable(BreadcrumbConfigManager.getHomepageConfig().enabled)
      .map(BooleanHelper.toBoolean)
      .orElse(true);
  }

  @Widget.Method()
  public async onHomepage() {
    const homepage = await ViewActionCache.getHomepage();
    if (!homepage) {
      throw new Error('Invalid homepage.');
    }
    this.router.push({
      segments: [
        {
          path: 'page',
          extra: { preserveParameter: false },
          parameters: generatorViewActionQueryParameter(homepage, { usingLastedUrlParameters: false })
        }
      ]
    });
  }

  /**
   * 在模块发生改变时调用
   * @param moduleName 模块名称
   * @protected
   */
  protected async onModuleChange(moduleName: string) {
    if (moduleName === this.moduleName) {
      return;
    }
    this.moduleName = moduleName;
    this.menuNodes = await this.fetchMenuNodes(moduleName);
  }

  /**
   * 根据模块名称获取菜单
   * @param moduleName 模块名称
   * @protected
   */
  protected async fetchMenuNodes(moduleName: string): Promise<TreeNode<RuntimeMenu>[]> {
    const menus = (await MenuService.queryMenus(moduleName)) as RuntimeMenu[];
    return MenuService.convert(menus);
  }

  protected async refreshItems(
    model: string,
    action: string,
    parameters: MenuUrlParameters | undefined
  ): Promise<void> {
    let selectedMenuItem: TreeNode<RuntimeMenu> | undefined;
    if (parameters) {
      const { selectedKeys } = parameters;
      const lastedSelectKey = selectedKeys[selectedKeys.length - 1];
      if (lastedSelectKey) {
        selectedMenuItem = MenuService.findSelectedMenuItemByKey(this.menuNodes, lastedSelectKey);
      }
    } else {
      selectedMenuItem = MenuService.findSelectedMenuItemByAction(this.menuNodes, action);
    }
    if (!selectedMenuItem) {
      this.items = [];
      return;
    }
    let items: RuntimeMenu[] = [];
    let currentNode: TreeNode<RuntimeMenu> | undefined = selectedMenuItem;
    while (currentNode) {
      items = [currentNode.value!, ...items];
      currentNode = currentNode.parent;
    }
    this.items = items;
  }

  protected async refreshViewTitle(model: string, action: string): Promise<void> {
    const viewAction = await ViewActionCache.get(model, action);
    // 菜单上的action不重复显示菜单名称和视图名称
    if (viewAction && viewAction.name !== this.items[this.items.length - 1]?.viewAction?.name) {
      this.currentViewTitle = ModuleService.generatorViewTitle(viewAction);
    } else {
      this.currentViewTitle = '';
    }
  }

  protected async reloadMaskProcess(reloadParameters: ReloadMaskCallChainingParameters) {
    if (!BreadcrumbConfigManager.isEnabled()) {
      return;
    }
    const { module, model, action, currentPage } = reloadParameters;
    await this.onModuleChange(module);

    let menuUrlParameters: MenuUrlParameters | undefined;
    if (currentPage) {
      const menu = currentPage.menu as string;
      if (menu) {
        menuUrlParameters = JSON.parse(menu);
      }
    }
    await Promise.allSettled([
      this.refreshItems(model, action, menuUrlParameters),
      this.refreshViewTitle(model, action)
    ]);
  }

  protected $$mounted() {
    super.$$mounted();
    this.matched = useMatched().matched;
    this.router = useRouter().router;
  }
}
