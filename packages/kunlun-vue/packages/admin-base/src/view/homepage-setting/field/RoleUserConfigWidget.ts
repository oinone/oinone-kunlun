import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { isEmpty, isEqual } from 'lodash-es';
import { ValidatorInfo, isValidatorSuccess } from '../../../typing';
import { FormFieldWidget } from '../../../basic';
import { FormStringFieldWidget } from '../../../field';
import RoleUserConfig from './RoleUserConfig.vue';
import {
  ExpressionValue,
  FetchValueOptions,
  FetchValueReturnType,
  HomepageConfigRule,
  RelationOptions,
  RoleUserOptions,
  RoleUserOptionsEnum,
  HomePageConfigKeys
} from '../typing';
import { fetchRoleList, fetchRoleOne, fetchUserList, fetchUserOne } from '../service/HomepageSettingService';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.Text,
    widget: 'RoleUserConfigWidget'
  })
)
export class RoleUserConfigWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(RoleUserConfig);
    return this;
  }

  @Widget.Reactive()
  protected get moduleName() {
    return this.model.moduleName;
  }

  @Widget.Reactive()
  protected successValidates: boolean[] = [];

  @Widget.Reactive()
  protected get initialExpressionValueList() {
    if (this.value) {
      let value: ExpressionValue[] = JSON.parse(this.value);
      if (typeof value === 'string') {
        value = JSON.parse(value);
      }
      return value.map((item: ExpressionValue, index) => {
        return {
          options: {
            RoleUserOptions: RoleUserOptions,
            RelationOptions: RelationOptions,
            fetchValue:
              item.roleUserEnum === RoleUserOptionsEnum.CurrentUser ? this.handleFetchUser : this.handleFetchRole,
            queryOne:
              item.roleUserEnum === RoleUserOptionsEnum.CurrentUser ? this.handleUserQueryOne : this.handleRoleQueryOne
          },
          values: item,
          key: Date.now().toString() + String(index)
        };
      });
    }
    return undefined;
  }

  @Widget.Method()
  public async handleFetchRole(options: FetchValueOptions): Promise<FetchValueReturnType> {
    const res = await fetchRoleList(this.moduleName, options.pagination, options.searchValue);
    const roles = res.content as any[];
    return {
      options: roles.map((item: any) => ({ label: item.displayName || item.name, value: item.id })),
      content: res.content,
      totalPages: res.totalPages
    };
  }

  @Widget.Method()
  public async handleUserQueryOne(id: string): Promise<Record<string, unknown>> {
    const res = await fetchUserOne(this.moduleName, id);
    return {
      label: res.displayName || res.name,
      value: res.id
    };
  }

  @Widget.Method()
  public async handleRoleQueryOne(id: string): Promise<Record<string, unknown>> {
    const res = await fetchRoleOne(this.moduleName, id);
    return {
      label: res.displayName || res.name,
      value: res.id
    };
  }

  @Widget.Method()
  public async handleFetchUser(options: FetchValueOptions): Promise<FetchValueReturnType> {
    const res = await fetchUserList(this.moduleName, options.pagination, options.searchValue);
    const users = res.content as any[];
    return {
      options: users.map((item: any) => ({ label: item.displayName || item.name, value: item.id })),
      content: res.content,
      totalPages: res.totalPages
    };
  }

  @Widget.Method()
  public roleUserConfigchange(jsonValue: string, backEndValue: string) {
    super.change(jsonValue);
    if (this.activeRecords && this.activeRecords.length > 0) {
      this.activeRecords[0].expression = backEndValue;
    }
  }

  @Widget.Inject('savedHomepageConfigRules')
  protected savedHomepageConfigRules: HomepageConfigRule[] | undefined = undefined;

  @Widget.Inject('useHomepageSetting')
  protected useHomepageSetting;

  @Widget.Reactive()
  protected get originRule() {
    return this.savedHomepageConfigRules?.find((item) => item.id === this.formData.id);
  }

  /**
   * 目的是为了监听 formData 是否有修改，修改的话移入修改态
   * @param next
   */
  @Widget.Watch('formData', { deep: true })
  public onFormDataChange(next: HomepageConfigRule) {
    const finalNext = Object.keys(next).reduce((acc, key) => {
      if (HomePageConfigKeys.includes(key)) {
        acc[key] = next[key];
      }
      return acc;
    }, {});
    const finalOrigin = this.originRule
      ? Object.keys(this.originRule).reduce((acc, key) => {
          if (HomePageConfigKeys.includes(key)) {
            acc[key] = this.originRule![key];
          }
          return acc;
        }, {})
      : {};
    if (!isEqual(finalNext, finalOrigin)) {
      // 如果未在修改态，移入
      this.useHomepageSetting.setUnCommittedRule(next);
    } else {
      // 如果在修改态，移出
    }
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();

    if (!isValidatorSuccess(res)) {
      return res;
    }

    let checkData: ExpressionValue[] | undefined;
    if (typeof this.value === 'string') {
      checkData = JSON.parse(this.value);
      if (typeof checkData === 'string') {
        checkData = JSON.parse(checkData);
      }
    }

    if (!checkData || !checkData.length) {
      return this.validatorError(translateValueByKey('必填'));
    }
    this.successValidates = new Array(checkData.length).fill(false);
    let hasFalse = false;
    for (let i = 0; i < checkData.length; i++) {
      const item = checkData[i];
      if (!isEmpty(item.roleUserValue)) {
        this.successValidates[i] = true;
      } else {
        hasFalse = true;
      }
    }
    if (hasFalse) {
      return this.validatorError(translateValueByKey('必填'));
    }

    return this.validatorSuccess();
  }
}
