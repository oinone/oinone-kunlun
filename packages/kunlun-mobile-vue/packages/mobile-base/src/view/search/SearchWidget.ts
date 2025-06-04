import {
  ActiveRecord,
  activeRecordsToJSONString,
  RefreshCallChainingParameters,
  RefreshCallChainingScope,
  RuntimeModelField
} from '@oinone/kunlun-engine';
import { ViewType, Entity, IModelField, ModelFieldType } from '@oinone/kunlun-meta';
import { getRouterInstance } from '@oinone/kunlun-router';
import { BooleanHelper, NumberHelper, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioMessage } from '@oinone/kunlun-vue-ui-mobile-vant';
import { Widget, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import { toString, isNil } from 'lodash-es';
import { EDirection, ISort } from '@oinone/kunlun-service';
import { BaseElementWidget, BaseSearchWidget, URL_SPLIT_SEPARATOR } from '../../basic';
import { UserPreferService } from '../../service';
import {
  GlobalKeywordSearchSubSymbol,
  IKeywordSearchInfo,
  SEARCH_WIDGET,
  UserSearchPrefer,
  UserSearchPreferField
} from '../../typing';
import DefaultSearch from './DefaultSearch.vue';
import KeywordSearchMetadataViewWidget from './KeywordSearchMetadataViewWidget';
import { CATE_ALL_OPTION } from './types';

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

  @Widget.Reactive()
  protected get topCateModelField(): RuntimeModelField | undefined {
    const cateField = this.cateFields?.[0];
    if (!cateField) {
      return undefined;
    }
    return this.rootRuntimeContext?.model.modelFields?.find(
      (a) => a && a.ttype === ModelFieldType.Enum && a.name === cateField
    );
  }

  @Widget.Reactive()
  protected get showTopCateAll() {
    return BooleanHelper.toBoolean(this.getDsl().showTopCateAll) || true;
  }

  @Widget.Reactive()
  protected get topCateFieldOptions() {
    const topCateModelField = this.topCateModelField as unknown as IModelField;
    return topCateModelField && topCateModelField?.options
      ? [...(this.showTopCateAll ? [CATE_ALL_OPTION] : []), ...topCateModelField.options]
      : [];
  }

  @Widget.Reactive()
  protected get secondCateModelField(): RuntimeModelField | undefined {
    const [topCateField, secondCateField] = this.cateFields!;
    if (!secondCateField || topCateField === secondCateField) {
      return undefined;
    }
    return this.rootRuntimeContext?.model.modelFields?.find(
      (a) => a && a.ttype === ModelFieldType.Enum && a.name === secondCateField
    );
  }

  @Widget.Reactive()
  protected get showSecondCateAll() {
    return BooleanHelper.toBoolean(this.getDsl().showSecondCateAll) || true;
  }

  @Widget.Reactive()
  protected get secondCateFieldOptions() {
    const secondCateModelField = this.secondCateModelField as unknown as IModelField;
    return this.topCateModelField && secondCateModelField && secondCateModelField?.options
      ? [...(this.showSecondCateAll ? [CATE_ALL_OPTION] : []), ...secondCateModelField.options]
      : [];
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

  @Widget.Reactive()
  public showKeywordSearchPopup = false;

  protected keywordSearchView?: KeywordSearchMetadataViewWidget;

  @Widget.Reactive()
  protected get keywordSearchViewHandle() {
    return this.keywordSearchView?.getHandle();
  }

  @Widget.Method()
  public changeKeywordSearchPopup(show) {
    if (this.keywordSearchView) {
      this.keywordSearchView.dispose();
    }
    if (show) {
      // 创建view
      const runtimeContext = this.metadataRuntimeContext!;
      this.keywordSearchView = this.createWidget(KeywordSearchMetadataViewWidget, 'keywordSearchView', {
        runtimeContext
      });
    }
    this.showKeywordSearchPopup = show;
  }

  @Widget.Reactive()
  public keywordSearching = false;

  @Widget.Method()
  @Widget.Provide()
  public changeKeywordSearching(keywordSearching: boolean) {
    this.keywordSearching = keywordSearching;
  }

  // 第一页的数据量
  @Widget.Reactive()
  public dataLength = 0;

  @Widget.Method()
  @Widget.Provide()
  public changeDataLength(length: number) {
    this.dataLength = length;
  }

  @Widget.Reactive()
  public showKeywordSearch = false;

  @Widget.Method()
  public changeKeywordSearch(showKeywordSearch) {
    this.showKeywordSearch = showKeywordSearch;
    this.keywordSearch$.subject.next({ showKeywordSearch });
  }

  @Widget.SubContext(GlobalKeywordSearchSubSymbol)
  protected keywordSearch$!: WidgetSubjection<IKeywordSearchInfo>;

  @Widget.Reactive()
  @Widget.Inject()
  public sortList;

  @Widget.Method()
  @Widget.Inject()
  public onSortChange;

  @Widget.Method()
  public onSort(sortList: ISort[]) {
    this.onSortChange?.(sortList);
    if (!this.inline) {
      const sortFields: string[] = [];
      const directions: EDirection[] = [];
      sortList?.forEach(({ sortField, direction }) => {
        if (sortField) {
          StringHelper.append(sortFields, sortField);
          StringHelper.append(directions, direction || EDirection.ASC);
        }
      });
      if (sortFields.length && directions.length) {
        getRouterInstance()?.push({
          segments: [
            {
              path: 'page',
              parameters: {
                sortField: sortFields.join(URL_SPLIT_SEPARATOR),
                direction: directions.join(URL_SPLIT_SEPARATOR)
              },
              extra: {
                preserveParameter: true
              }
            }
          ]
        });
        this.refreshCallChaining?.call(false);
      }
    } else {
      // TODO
    }
  }

  @Widget.Method()
  public onSearch() {
    this.innerSearch(this.getSearchCondition());
  }

  public getSearchCondition(isCateSearch = false) {
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
        expand: toString(this.isExpand),
        cateSearch: toString(isCateSearch)
      }
    };
  }

  public innerSearch(entity) {
    const { searchString, searchBody, searchRequestCondition } = entity;
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
  public onCateSearch(searchData: Entity) {
    Object.assign(this.formData, searchData);
    this.onSearch();
  }

  @Widget.Method()
  public onKeywordSearch(domainRsql = '') {
    this.keywordSearchView?.searchByDomain(domainRsql);
  }

  @Widget.Reactive()
  public get metadataModel() {
    return this.metadataRuntimeContext?.model;
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
    const model = this.metadataRuntimeContext.model.model;
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

    this.keywordSearch$.subscribe(({ showKeywordSearchPopup }) => {
      if (!isNil(showKeywordSearchPopup)) {
        this.changeKeywordSearchPopup(showKeywordSearchPopup);
      }
    });
  }
}
