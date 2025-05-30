import { executeViewAction, ModelCache, RuntimeModel } from '@kunlun/engine';
import { IModel } from '@kunlun/meta';
import { getRouterInstance, Matched, Router, useMatched } from '@kunlun/router';
import { http } from '@kunlun/service';
import { CastHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { VueWidget, Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../basic';
import AppsBusinessScreen from './AppsBusinessScreen.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'AppsBusinessScreen'
  })
)
export class AppsBusinessScreenWidget extends VueWidget {
  @Widget.Reactive()
  protected model: RuntimeModel | undefined;

  @Widget.Reactive()
  private appsData: Record<string, unknown> = {};

  public initialize(props) {
    super.initialize(props);
    this.setComponent(AppsBusinessScreen);
    return this;
  }

  private router: Router | null = null;

  private matched: Matched | null = null;

  public async fetchData() {
    this.model = await ModelCache.getAll('apps.AppsManagementModule');

    const { matched } = useMatched();
    this.matched = matched;
    this.router = getRouterInstance();
    const body = `{
      businessScreenTransientQuery {
        construct(businessScreen: {}) {
          categories {
            name
            code
            children {
              name
              appModules {
                id
                sys
                homePageModel
                systemSource
                displayName
                homePageName
                name
                sign
                logo
                module
                hash
                dsKey
                summary
                description
                state
                boot
                application
                latestVersion
                platformVersion
                publishedVersion
                publishCount
                category
                moduleDependencies
                moduleExclusions
                excludeHooks
                priority
                website
                author
                demo
                web
                license
                toBuy
                maintainer
                contributors
                url
                selfBuilt
                metaSource
              }
            }
          }
          id
        }
      }
    }
    `;

    const result = (await http.query('base', body)).data;

    this.appsData = (result as any).businessScreenTransientQuery.construct.categories || [];
    return this.appsData;
  }

  @Widget.Method()
  private async queryModuleRelation(moduleName) {
    const body = `query {
      businessScreenRelationQuery {
        fetchRelation(data: { module: "${moduleName}" }) {
          id
          module
          displayName
          logo
          state
          application
          upNodes {
            id
            module
            displayName
            logo
            state
            application
          }
          upPaths {
            fromModule
            toModule
          }
          downNodes {
            id
            module
            displayName
            logo
            state
            application
          }
          downPaths {
            fromModule
            toModule
          }
        }
      }
    }`;

    const res = (await http.query('base', body)) as any;
    return res.data.businessScreenRelationQuery.fetchRelation;
  }

  @Widget.Method()
  public executeAction(record) {
    // 获取绑定的视图的originModel的元数据ViewActionList
    // 已经安装的去技术页面，未安装的去介绍页面
    const model = this.model as unknown as IModel;
    const action = model?.viewActionList?.filter((v) => v.name === 'apps_business_screen_detail')[0];
    if (action && this.router && this.matched) {
      executeViewAction(CastHelper.cast(action), this.router, this.matched, {
        appsManagementModule: {},
        id: record.id,
        state: record.state
      });
    }
  }

  mounted() {
    this.fetchData();
  }
}
