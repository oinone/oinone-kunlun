import { Condition } from '@oinone/kunlun-request';
import { ISort, EDirection, IQueryPageOption, queryPage } from '@oinone/kunlun-service';
import { Subject, distinctUntilChanged } from '@oinone/kunlun-state';
import { isPromise } from '@oinone/kunlun-meta';
import { getRouterInstance, useMatched } from '@oinone/kunlun-router';
import { ViewVM } from './view';

import { IListValue, EntityBody, Pagination, PaginationChange, IBaseListProps } from '../typing/interface';

const sortDirections = {
  desc: EDirection.DESC,
  asc: EDirection.ASC
};

// TODO List还需要接管Search，Action

/**
 * List 形态的视图，管理着数据源跟分页
 */
export class ListVM<P extends IBaseListProps = IBaseListProps> extends ViewVM<IListValue, P> {
  constructor(initializer: P) {
    super(initializer);

    if (initializer.fetchListDataHook) {
      this.fetchListDataHook = initializer.fetchListDataHook;
    }
  }

  public cacheRecords: IListValue = [];

  private pagination: Pagination | undefined;

  public pagination$: Subject<Pagination> = new Subject();

  protected paginationChange = false;

  public fetchListDataHook(param: PaginationChange) {
    if (!this.isRoot) {
      return;
    }

    const currentPage = param.current;
    const { sortField = '', direction = '' } = param.sort || {};

    const params = {
      currentPage,
      pageSize: param.pageSize
    };

    if (sortField && direction) {
      Object.assign(params, {
        sortField,
        direction
      });
    }

    getRouterInstance().push({
      segments: [
        {
          path: 'page',
          parameters: params as any,
          extra: {
            preserveParameter: true
          }
        }
      ]
    });
  }

  /**
   *
   * @param  {number} current 当前分页
   * @param  {number} pageSize 每页大小
   * @param  { {field:string; order:string} } sorter? 排序
   */
  public async onPaginationChange(
    current: number,
    pageSize: number,
    sorter?: { field: string; order: string }
  ): Promise<PaginationChange> {
    this.setBusy(true);

    const segmentPage = useMatched().matched.segmentParams;

    const { sortField = '', direction = '' } = segmentPage;

    const urlParams: PaginationChange = { current, pageSize } || {};

    if (sortField && direction) {
      Object.assign(urlParams, { sort: { sortField, direction } });
    }

    if ((segmentPage.currentPage || '1') === current && sorter && Object.keys(sorter).length) {
      const { field, order } = sorter;
      const sortGroup: ISort = { sortField: field, direction: sortDirections[order] };

      Object.assign(urlParams, { sort: sortGroup });
    }

    if (this.fetchListDataHook) {
      if (isPromise(this.fetchListDataHook)) {
        await this.fetchListDataHook(urlParams);
      } else {
        this.fetchListDataHook(urlParams);
      }
    }

    this.setBusy(false);

    return urlParams;
  }

  /**
   * 默认的 List 视图数据请求, 允许被重写
   */
  public async fetchData(
    content: Record<string, unknown>[] = [],
    pageOption: IQueryPageOption = {},
    variables: Record<string, unknown> = {}
  ) {
    this.setBusy(true);

    try {
      const reqData = content[0] || {};
      const condition = new Condition('1==1');

      if (Object.keys(reqData).length !== 0) {
        Object.keys(reqData).forEach((c) => {
          condition.and(new Condition(c).equal(reqData[c] as string));
        });
      }

      const res = await queryPage(this.model!.model, { condition, ...pageOption }, undefined, variables, {
        maxDepth: 1
      });

      this.setPagination({ total: res.totalElements, pageSize: res.size, current: pageOption.currentPage || 1 });
      const data = res.content || [];

      this.setData(data);
      this.setBusy(false);
    } catch (error) {
      console.error(error);
      this.setBusy(false);
    }

    return this.viewData;
  }

  /**
   * 加载数据
   */
  public loadData(data: IListValue) {
    this.viewData = [...data];

    this.setViewData(this.viewData);
  }

  /**
   * 设置分页
   */
  public setPagination(pag: Pagination) {
    this.pagination = {
      ...(this.pagination || {}),
      total: pag.total,
      pageSize: pag.pageSize,
      current: pag.current || 1
    };

    if (this.pagination$ && !this.pagination$.closed) {
      this.pagination$.next(this.pagination);
    }
  }

  /**
   * 获取分页信息
   */
  public getPagination() {
    return this.pagination;
  }

  /**
   * 实时获取分页信息
   * @param  {(p:Pagination)=>void} cb 回调函数
   * @param  {distinct: boolean} options 配置项， distinct -> 是否去重，默认为false
   */
  public watchPagination(cb: (p: Pagination) => void, options: { distinct: boolean } = { distinct: false }) {
    if (this.pagination$ && !this.pagination$.closed) {
      const stream = this.pagination$;
      if (options && options.distinct) {
        stream.pipe(distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y))).subscribe(cb);
      } else {
        stream.subscribe(cb);
      }
    }
  }

  /**
   * 获取当前数据源
   */
  public getData() {
    return this.viewData;
  }

  /**
   * 根据下标获取对应的数据源
   */
  public getDataByIndex(index: number) {
    return this.viewData[index];
  }

  /**
   * 修改数据源
   */
  public setData(data: IListValue) {
    this.setViewData(JSON.parse(JSON.stringify(data)));
  }

  /**
   * 修改对应下标数据源
   */
  public setDataByIndex(index: number, data: EntityBody) {
    this.viewData[index] = data;
    this.setViewData(this.viewData);
  }

  /**
   * 插入数据
   */
  public insertRecords(records: IListValue) {
    this.cacheRecords.push(...records);
    this.viewData.push(...records);
    this.setViewData(this.viewData);
  }

  /**
   * 修改数据
   */
  public updateRecords(index: number, record: EntityBody) {
    this.cacheRecords[index] = record;
    this.viewData[index] = record;
    this.setViewData(this.viewData);
  }

  /**
   * 删除数据
   */
  public deleteRecords(records: IListValue) {
    records.forEach((record) => {
      let index = this.cacheRecords.findIndex((r) => this.isSameRecord(r, record));
      if (index !== -1) {
        this.cacheRecords.splice(index, 1);
      }
      index = this.viewData.findIndex((r) => this.isSameRecord(r, record));
      if (index !== -1) {
        this.viewData.splice(index, 1);
      }
    });

    this.setViewData(this.viewData);
  }

  public isSameRecord(recordA: EntityBody, recordB: EntityBody) {
    const pks = this.model!.pk;
    if (pks.length) {
      for (let index = 0; index < pks.length; index++) {
        if (recordA[pks[index]] !== recordB[pks[index]]) {
          return false;
        }
      }
      return true;
    }
    return recordA === recordB;
  }

  public unsubscribe() {
    this.pagination$.unsubscribe();
    super.unsubscribe();
  }
}
