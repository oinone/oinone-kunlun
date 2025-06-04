import {
  ActiveRecord,
  activeRecordsToJSONString,
  RefreshCallChainingParameters,
  RefreshCallChainingScope
} from '@oinone/kunlun-engine';
import { LifeCycleHeart } from '@oinone/kunlun-event';
import { ViewType } from '@oinone/kunlun-meta';
import { getRouterInstance, useMatched } from '@oinone/kunlun-router';
import { CallChaining, CastHelper, NumberHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { parseActionDomain4search } from '@oinone/kunlun-vue-admin-layout';
import { Widget } from '@oinone/kunlun-vue-widget';
import { cloneDeep, debounce } from 'lodash-es';
import { BaseElementWidget, BaseFieldWidget, BaseSearchWidget, QueryExpression } from '../../../basic';
import { FormStringInputFieldWidget } from '../../../field';
import { groupChangeBehavior } from '../../action';
import { IconGroupSelectWidget } from '../../field/IconGroupSelectWidget';
import { createGroup, deleteGroup, fetchAllGroup, IconGroup, modifyGroup } from '../../service/IconManageService';
import IconSearch from './IconSearch.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Search,
    widget: 'iconSearch'
  })
)
export class IconSearchWidget extends BaseSearchWidget {
  protected searchString = '';

  public initialize(props) {
    super.initialize(props);
    this.setComponent(IconSearch);
    return this;
  }

  @Widget.Reactive()
  protected get foldSize() {
    return NumberHelper.toNumber(this.getDsl().foldSize) || 5;
  }

  @Widget.Method()
  protected onUploadIcon() {}

  @Widget.Reactive()
  protected widgetGroup = {} as any;

  @Widget.Reactive()
  protected currentGroup: IconGroup | undefined = undefined;

  @Widget.Reactive()
  protected groupList: IconGroup[] = [];

  @Widget.Method()
  protected async queryGroupList(useCondition = true) {
    this.groupList = await fetchAllGroup(this.rootRuntimeContext.model.moduleName);
  }

  @Widget.Method()
  @Widget.Provide()
  protected onChangeWidgetGroup(val, notChange?: boolean) {
    if (this.currentGroup?.id === val.id) {
      return;
    }
    this.currentGroup = val;
    if (notChange) {
      return;
    }

    const iconGroupSelectWidget = this.getChildren().find((child) => child instanceof IconGroupSelectWidget);
    if (iconGroupSelectWidget) {
      if (val.id === '-1') {
        (iconGroupSelectWidget as any).change(null);
      } else {
        (iconGroupSelectWidget as any).change(val);
      }
    }
  }

  @Widget.Method()
  protected async onDeleteGroup(group) {
    const { name, id } = group;
    await deleteGroup({ model: this.rootRuntimeContext.model.moduleName, name, id });
  }

  @Widget.Method()
  protected async onModifyGroup(group) {
    const { name, id } = group;
    await modifyGroup({ model: this.rootRuntimeContext.model.moduleName, name, id });
  }

  @Widget.Method()
  protected async onCreateGroup(displayName: string) {
    await createGroup({ model: this.rootRuntimeContext.model.moduleName, name: displayName });
  }

  @Widget.Method()
  protected onManageGroup() {}

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
    this.flushSearchParameters?.(searchBody, []);
    const refreshParameter: RefreshCallChainingParameters = {
      scope: RefreshCallChainingScope.search,
      refreshParent: false,
      currentPage: 1
    };
    this.refreshCallChaining?.syncCall(refreshParameter);
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
        currentPage: '1'
      }
    };
  }

  protected registerFieldChangeEventListener() {
    this.getChildren().forEach((child) => {
      if (child instanceof FormStringInputFieldWidget) {
        child.on('change', debounce(this.onSearch, 400));
      } else {
        if (child instanceof BaseFieldWidget) {
          child.on('change', this.onSearch);
        }
      }
    });
  }

  protected $$mounted() {
    super.$$mounted();
    this.registerFieldChangeEventListener();
    groupChangeBehavior.subscribe(() => {
      this.queryGroupList();
    });

    let searchBody: ActiveRecord | undefined;
    let searchConditions: QueryExpression[] | undefined;
    let isMergeInitialValue = false;
    if (!this.inline) {
      const { page } = useMatched().matched.segmentParams;
      if (page) {
        const { searchBody: searchBodyString, searchConditions: searchConditionsString } = page;
        if (searchBodyString) {
          searchBody = JSON.parse(decodeURIComponent(searchBodyString));
        }
        if (searchConditionsString) {
          searchConditions = JSON.parse(decodeURIComponent(searchConditionsString));
        }
      }
    }
    const { metadataRuntimeContext, rootRuntimeContext } = this;
    const { model } = rootRuntimeContext;
    const domain =
      metadataRuntimeContext.viewAction?.domain ||
      metadataRuntimeContext.view.domain ||
      metadataRuntimeContext.viewTemplate?.domain;
    if (model && domain && !searchBody && !searchConditions) {
      const { searchBody: domainSearchBody, searchConditions: domainSearchCondition } = parseActionDomain4search(
        CastHelper.cast(model),
        domain
      );
      searchBody = domainSearchBody;
      searchConditions = domainSearchCondition;
      isMergeInitialValue = true;
    }

    this.mountedCallChaining?.hook(
      this.path,
      async () => {
        // 请求数据源
        let finalSearchBody = searchBody;
        if (isMergeInitialValue || !finalSearchBody) {
          finalSearchBody = {
            ...(await rootRuntimeContext.getInitialValue()),
            ...(finalSearchBody || {})
          };
        }
        this.reloadActiveRecords(finalSearchBody);
        this.flushSearchParameters?.(finalSearchBody, searchConditions);
        this.defaultSearchCondition = cloneDeep(this.searchConditions);
        // 请求分组
        await this.queryGroupList();
      },
      CallChaining.MAX_PRIORITY
    );
  }

  protected $$unmounted() {
    LifeCycleHeart.dispose(this.getNodeCode());
  }
}
