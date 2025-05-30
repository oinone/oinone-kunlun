import {
  ActiveRecord,
  activeRecordsToJSONString,
  RefreshCallChainingParameters,
  RefreshCallChainingScope
} from '@kunlun/engine';
import { Entity, ViewType } from '@kunlun/meta';
import { getRouterInstance } from '@kunlun/router';
import { BooleanHelper, NumberHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { OioMessage } from '@kunlun/vue-ui-antd';
import { Widget } from '@kunlun/vue-widget';
import { toString } from 'lodash-es';
import { BaseElementWidget, BaseSearchWidget } from '../../basic';
import { UserPreferService } from '../../service';
import { SEARCH_WIDGET, UserSearchPrefer, UserSearchPreferField } from '../../typing';
import DefaultSearch from './DefaultSearch.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Search,
    widget: ['search', SEARCH_WIDGET]
  })
)
export class SearchWidget extends BaseSearchWidget {
  protected searchString = '';

  @Widget.Reactive()
  protected isExpand = false;

  @Widget.Reactive()
  protected get invisibleSearch() {
    return BooleanHelper.toBoolean(this.getDsl().invisibleSearch) || false;
  }

  @Widget.Reactive()
  protected get disabledExpand() {
    return BooleanHelper.toBoolean(this.getDsl().disabledExpand) || false;
  }

  @Widget.Reactive()
  protected get foldSize() {
    return NumberHelper.toNumber(this.getDsl().foldSize) || 3;
  }

  @Widget.Reactive()
  protected get cateFields(): string[] {
    const { cateFields = '' } = this.getDsl();
    if (!cateFields) {
      return [];
    }
    const [topCateField, secondCateField] = cateFields?.split(',');
    if (!secondCateField || topCateField === secondCateField) {
      return [topCateField];
    }
    return [topCateField, secondCateField];
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultSearch);
    return this;
  }

  @Widget.Method()
  public onExpand(expand: boolean) {
    this.isExpand = expand;
  }

  @Widget.Method()
  @Widget.Provide()
  public onSearch() {
    const { searchString, searchBody, searchRequestCondition } = this.getSearchCondition();
    const isEqual = this.searchString === searchString;
    if (!isEqual) {
      this.searchString = searchString;
      if (!this.inline) {
        getRouterInstance()!.push({
          segments: [
            {
              path: 'page',
              parameters: searchRequestCondition,
              extra: { preserveParameter: true }
            }
          ]
        });
      }
    }
    this.flushSearchParameters?.(searchBody, this.searchConditions);
    const refreshParameter: RefreshCallChainingParameters = {
      scope: RefreshCallChainingScope.search,
      refreshParent: false,
      currentPage: 1
    };
    this.refreshCallChaining?.syncCall(refreshParameter);
  }

  @Widget.Method()
  @Widget.Provide()
  public onCateSearch(searchData: Entity) {
    Object.assign(this.formData, searchData);
    this.onSearch();
  }

  @Widget.Method()
  public async onReset() {
    await super.onReset();
    this.searchString = '';
    this.selectedPrefer = undefined;
  }

  public getSearchCondition() {
    const formData = { ...this.formData };
    const searchBody = activeRecordsToJSONString(formData) || '';
    return {
      searchString: searchBody,
      searchBody: formData,
      searchRequestCondition: {
        ...{
          // 模型对象的数据作为条件
          searchBody
        },
        currentPage: '1',
        expand: toString(this.isExpand)
      }
    };
  }

  // region search prefer

  @Widget.Reactive()
  protected searchPreferOptions: UserSearchPrefer[] | undefined;

  @Widget.Reactive()
  protected selectedPrefer: UserSearchPrefer | undefined;

  @Widget.Reactive()
  protected get showSearchPrefer(): boolean {
    return !this.inline && !!this.metadataRuntimeContext.view.name;
  }

  @Widget.Method()
  protected async onLoadSearchPreferOptions() {
    if (!this.searchPreferOptions) {
      this.searchPreferOptions = await this.loadSearchPreferOptions();
    }
  }

  protected loadSearchPreferOptions() {
    const { model } = this.metadataRuntimeContext.model;
    const viewName = this.metadataRuntimeContext.view.name;
    if (!viewName) {
      return [];
    }
    return UserPreferService.queryPreferForSearch(model, viewName);
  }

  @Widget.Method()
  protected async onCreateSearchPrefer(value: UserSearchPrefer): Promise<boolean> {
    const viewName = this.metadataRuntimeContext.view?.name;
    if (!viewName) {
      throw new Error('Invalid view name');
    }
    const { searchBody } = this.getSearchCondition();
    const searchFields = Object.keys(searchBody || {}) as string[];
    const displayFields = this.rootRuntimeContext.model.modelFields || [];
    const searchPreferFields: UserSearchPreferField[] = [];
    for (const displayField of displayFields) {
      if (searchFields.includes(displayField.data)) {
        searchPreferFields.push({
          data: displayField.data,
          label: displayField.displayName || displayField.label || ''
        });
      }
    }
    const newSearchPrefer = await UserPreferService.createPreferForSearch({
      ...value,
      model: this.rootRuntimeContext.model.model,
      viewName,
      searchPrefer: {
        searchBody,
        searchPreferFields
      }
    });
    this.searchPreferOptions!.push(newSearchPrefer);
    this.selectedPrefer = newSearchPrefer;
    return true;
  }

  @Widget.Method()
  protected async onUpdateSearchPrefer(value: UserSearchPrefer): Promise<boolean> {
    const { id, name } = value;
    await UserPreferService.updatePreferNameForSearch(id, name);
    const targetIndex = this.searchPreferOptions!.findIndex((v) => v.id === id);
    if (targetIndex !== -1) {
      const newPreferOption = {
        ...this.searchPreferOptions![targetIndex],
        name
      };
      this.searchPreferOptions![targetIndex] = newPreferOption;
      if (this.selectedPrefer?.id === id) {
        this.selectedPrefer = newPreferOption;
      }
    }
    return true;
  }

  @Widget.Method()
  protected async onRemoveSearchPrefer(value: UserSearchPrefer): Promise<boolean> {
    const { id } = value;
    const targetIndex = this.searchPreferOptions!.findIndex((v) => v.id === id);
    if (targetIndex !== -1) {
      await UserPreferService.deletePreferForSearch(id);
      this.searchPreferOptions!.splice(targetIndex, 1);
    }
    return true;
  }

  @Widget.Method()
  protected onSelectSearchPrefer(value: UserSearchPrefer) {
    this.selectedPrefer = value;
    const { searchBody, searchPreferFields } = value.searchPrefer;
    const preferSearchBody: ActiveRecord = {};
    const fieldNames = (this.rootRuntimeContext.model.modelFields || []).map((f) => f.data) as string[];
    for (const searchPreferField of searchPreferFields) {
      const { data, label } = searchPreferField;
      if (fieldNames.includes(data)) {
        preferSearchBody[data] = searchBody[data];
      } else {
        OioMessage.warning(`此方案 \<${label}\> 字段已失效`);
      }
    }
    this.reloadActiveRecords(preferSearchBody);
    this.onSearch();
  }

  @Widget.Method()
  protected async onUnselectSearchPrefer() {
    this.selectedPrefer = undefined;
    await this.onReset();
  }

  protected $$mounted() {
    super.$$mounted();
    this.isExpand = BooleanHelper.toBoolean(this.urlParameters.expand) || false;
  }
}
