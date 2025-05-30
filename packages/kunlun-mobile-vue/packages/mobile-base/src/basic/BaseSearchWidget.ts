import { ActiveRecord } from '@kunlun/engine';
import { getRouterInstance, useMatched } from '@kunlun/router';
import { CallChaining, CastHelper, NumberHelper } from '@kunlun/shared';
import { Widget } from '@kunlun/vue-widget';
import { cloneDeep, isNil } from 'lodash-es';
import { parseActionDomain4search } from '../layout/utils';
import { BaseElementWidget } from './token';
import { QueryExpression } from './types';

export class BaseSearchWidget extends BaseElementWidget {
  protected defaultAllInvisible = true;

  @Widget.Reactive()
  @Widget.Inject('cols')
  protected parentCols: number | undefined;

  @Widget.Provide()
  @Widget.Reactive()
  public get cols() {
    let cols = NumberHelper.toNumber(this.getDsl().cols) as number | undefined;
    if (isNil(cols)) {
      cols = 1;
    }
    return cols;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected searchBody: ActiveRecord | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected searchConditions: QueryExpression[] | undefined;

  @Widget.Method()
  @Widget.Inject()
  public flushSearchParameters: ((searchBody, searchConditions?) => void) | undefined;

  /**
   * 挂载时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining | undefined;

  /**
   * 刷新时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected refreshCallChaining: CallChaining<boolean> | undefined;

  protected defaultSearchBody: ActiveRecord | undefined;

  protected defaultSearchCondition: QueryExpression[] | undefined;

  @Widget.Reactive()
  public get formData(): ActiveRecord {
    return this.activeRecords?.[0] || {};
  }

  @Widget.Method()
  public onSearch() {
    this.flushSearchParameters?.(this.formData, this.searchConditions);
    this.refreshCallChaining?.syncCall(false);
  }

  @Widget.Method()
  public async onReset() {
    const defaultValue = cloneDeep(this.defaultSearchBody);
    let defaultCondition = cloneDeep(this.defaultSearchCondition);
    if (!defaultCondition) {
      defaultCondition = [];
      this.defaultSearchCondition = [];
    }
    if (!this.inline) {
      getRouterInstance()!.push({
        segments: [
          {
            path: 'page',
            parameters: {
              searchBody: undefined,
              currentPage: undefined
            },
            extra: { preserveParameter: true }
          }
        ]
      });
    }
    this.reloadActiveRecords(defaultValue);
    this.flushSearchParameters?.(defaultValue, defaultCondition);
    this.refreshCallChaining?.syncCall(false);
  }

  protected $$mounted() {
    super.$$mounted();
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
    if (searchBody) {
      this.reloadActiveRecords(searchBody);
    }
    this.mountedCallChaining?.hook(
      this.path,
      async () => {
        let finalSearchBody = searchBody;
        const initialContext = this.initialContext || {};
        const initialValue = await rootRuntimeContext.getInitialValue();
        if (isMergeInitialValue || !finalSearchBody) {
          finalSearchBody = {
            ...initialValue,
            ...(finalSearchBody || {})
          };
        }
        finalSearchBody = {
          ...initialContext,
          ...(finalSearchBody || {})
        };
        this.reloadActiveRecords(finalSearchBody);
        this.flushSearchParameters?.(finalSearchBody, searchConditions);
        this.defaultSearchBody = cloneDeep({
          ...initialContext,
          ...initialValue
        });
        this.defaultSearchCondition = cloneDeep(this.searchConditions);
      },
      CallChaining.MAX_PRIORITY
    );
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.mountedCallChaining?.unhook(this.path);
  }
}
