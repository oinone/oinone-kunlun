import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { IModule } from '@oinone/kunlun-meta';
import { BaseElementWidget, BaseFormWidget, UrlQueryParameters } from '../../../../basic';
import AdvancedHomepageSetting from './AdvancedHomepageSetting.vue';
import {
  saveHomepageSettingConfig,
  queryHomepageConfig,
  fetchModuleList,
  fetchModuleOne
} from '../../service/HomepageSettingService';
import { RenderWidgetsBehavior, ValidateWidgetsBehavior } from '../../service/behaviors';
import {
  BindingTypeEnum,
  EnableStatusOptionsEnum,
  FetchValueOptions,
  FetchValueReturnType,
  HomepageConfigRule
} from '../../typing';
import { sortFn, useHomepageSetting } from '../../hook/useHomepageSetting';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'AdvancedHomepageSettingWidget' }))
export class AdvancedHomepageSettingWidget extends BaseFormWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(AdvancedHomepageSetting);

    return this;
  }

  @Widget.Reactive()
  @Widget.Provide('useHomepageSetting')
  private useHomepageSetting = useHomepageSetting();

  // 搜索过滤部分
  @Widget.Reactive()
  private searchModule:
    | { key: string; label: string; value: string; option: { label: string; value: string; origin: IModule } }
    | undefined = undefined;

  @Widget.Reactive()
  private searchEnableStatus: EnableStatusOptionsEnum | undefined = undefined;

  @Widget.Method()
  protected async onSearchModuleChange(module: any) {
    this.searchModule = module;
    this.reloadRuntimeHomepageConfig();
  }

  @Widget.Method()
  protected async onSearchEnabledStatusChange(status?: EnableStatusOptionsEnum) {
    this.searchEnableStatus = status === null ? undefined : status;
    this.reloadRuntimeHomepageConfig();
  }

  @Widget.Method()
  public async handleFetchModule(options: FetchValueOptions): Promise<FetchValueReturnType> {
    const res = await fetchModuleList(options.pagination, options.searchValue);
    const roles = res.content as any[];
    return {
      options: roles.map((item: any) => ({ label: item.displayName || item.name, value: item.id, origin: item })),
      content: res.content,
      totalPages: res.totalPages
    };
  }

  @Widget.Method()
  public async handleModuleQueryOne(): Promise<Record<string, unknown>> {
    const res = await fetchModuleOne(this.searchModule?.option.origin.module);
    return {
      label: res.displayName || res.name,
      value: res.id,
      origin: res
    };
  }
  // end 搜索过滤部分

  @Widget.Reactive()
  protected handleAdd() {
    const condition = {
      enabled: this.searchEnableStatus === EnableStatusOptionsEnum.Forbidden ? false : true,
      bindHomePageModule: this.searchModule?.option.origin as { id: string; displayName: string; module: string }
    };
    RenderWidgetsBehavior.next({ emitName: 'addAdvancedHomepageRule', arg: condition });
  }

  @Widget.Reactive()
  private supportAdvancedHomepageConfig: boolean = false;

  @Widget.Method()
  protected changeSupportAdvancedHomepageConfig(support: boolean) {
    this.supportAdvancedHomepageConfig = support;
  }

  // 已经保存的规则配置
  @Widget.Reactive()
  @Widget.Provide('savedHomepageConfigRules')
  private savedHomepageConfigRules: HomepageConfigRule[] | undefined = undefined;

  // 运行时的规则配置，用于前端筛选后展示，包含修改后暂未提交的数据
  @Widget.Reactive()
  @Widget.Provide('runtimeHomepageConfigRules')
  private runtimeHomepageConfigRules: HomepageConfigRule[] | undefined = undefined;

  @Widget.Method()
  protected goBack() {
    window.history.back();
  }

  @Widget.Method()
  protected async onSaveHomepageSettingConfig() {
    const sub = ValidateWidgetsBehavior.subscribe((value) => {
      if (value === 'validateSuccess') {
        this.saveHomepageSettingConfig();
        sub.unsubscribe();
      } else if (value === 'validateError') {
        sub.unsubscribe();
      }
    });
    ValidateWidgetsBehavior.next('validator');
  }

  protected async saveHomepageSettingConfig() {
    const savedHomepageConfigRules = this.useHomepageSetting.getSavedHomepageConfigRules();
    const unCommittedRules = this.useHomepageSetting.getUncommitedHomepageConfigRules();
    const res = await saveHomepageSettingConfig(this.model.moduleName, {
      state: this.supportAdvancedHomepageConfig,
      rules: [...savedHomepageConfigRules, ...unCommittedRules].sort(sortFn)
    });

    if (res.error) {
      OioNotification.error(translateValueByKey('失败'), translateValueByKey(res.error as string));
    } else {
      this.onSaveHomepageSettingConfigSuccess();
      OioNotification.success(translateValueByKey('成功'), translateValueByKey('配置应用首页成功'));
    }
  }

  protected onSaveHomepageSettingConfigSuccess() {
    this.useHomepageSetting.saveUncommitedRules();
    this.savedHomepageConfigRules = this.useHomepageSetting.getSavedHomepageConfigRules();
    this.reloadRuntimeHomepageConfig();
  }

  protected async queryHomepageConfig() {
    const homePage = await queryHomepageConfig();

    this.savedHomepageConfigRules = homePage?.rules || undefined;
    this.supportAdvancedHomepageConfig = homePage?.state || false;
    this.useHomepageSetting.setSavedRules(this.savedHomepageConfigRules || []);
  }

  protected async reloadRuntimeHomepageConfig() {
    this.load(this.$reloadRuntimeHomepageConfig.bind(this));
  }

  protected async $reloadRuntimeHomepageConfig() {
    const searchParameters: UrlQueryParameters = {};
    const condition = {
      module: this.searchModule?.option.origin,
      enabled: this.searchEnableStatus
    };
    searchParameters.searchBody = JSON.stringify(condition);
    this.$router.push({
      segments: [
        {
          path: 'page',
          parameters: searchParameters,
          extra: {
            preserveParameter: true
          }
        }
      ]
    });

    this.runtimeHomepageConfigRules = this.useHomepageSetting.getRulesByOption({
      module: condition?.module?.module,
      enabled:
        condition?.enabled === EnableStatusOptionsEnum.Enable
          ? true
          : condition?.enabled === EnableStatusOptionsEnum.Forbidden
          ? false
          : undefined
    });
    if (this.runtimeHomepageConfigRules.length === 0) {
      const unCommittedRules = {
        code: '',
        ruleName: '',
        expression: '',
        expressionJson: '',
        bindingType: BindingTypeEnum.MENU,
        enabled: this.searchEnableStatus === EnableStatusOptionsEnum.Forbidden ? false : true,
        bindHomePageModule: this.searchModule?.option.origin as { id: string; module: string; displayName: string }
      };
      this.useHomepageSetting.setUnCommittedRule(unCommittedRules);
      this.runtimeHomepageConfigRules = [unCommittedRules];
    }
    RenderWidgetsBehavior.next({ emitName: 'reloadHomepageConfig' });
  }

  protected async beforeMount() {
    super.beforeMount();
    const searchBody = this.urlParameters.searchBody ? JSON.parse(this.urlParameters.searchBody) : {};
    if (searchBody.module) {
      this.searchModule = {
        key: searchBody.module?.id,
        value: searchBody.module?.id,
        label: searchBody.module?.displayName || searchBody.module?.module,
        option: {
          value: searchBody.module?.id,
          label: searchBody.module?.displayName || searchBody.module?.module,
          origin: searchBody.module
        }
      };
    }
    this.searchEnableStatus = searchBody.enabled;
    await this.queryHomepageConfig();
    this.reloadRuntimeHomepageConfig();
  }
}
