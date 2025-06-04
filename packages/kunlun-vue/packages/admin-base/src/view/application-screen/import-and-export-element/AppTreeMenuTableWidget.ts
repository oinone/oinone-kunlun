import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';

import { BaseElementWidget } from '../../../basic';
import { TableWidget } from '../../table';
import { ViewType } from '@oinone/kunlun-meta';
import { ListPaginationStyle } from '@oinone/kunlun-vue-ui-common';
import { ActiveRecord, Pagination, QueryContext, QueryPageResult, QueryVariables } from '@oinone/kunlun-engine';
import { Condition } from '@oinone/kunlun-request';
import { ISort, customQueryPage, queryPage } from '@oinone/kunlun-service';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: ['table', 'Table'],
    model: ['dmeta.UIDesignerMenuMetaExport']
  })
)
export class AppTreeMenuTableWidget extends TableWidget {
  @Widget.Reactive()
  protected get treeConfig() {
    return { transform: true, rowField: 'name', parentField: 'parentName' } as any;
  }

  @Widget.Reactive()
  protected get paginationStyle(): ListPaginationStyle {
    return ListPaginationStyle.HIDDEN;
  }

  protected reloadTableInstanceActiveRecords() {}
}

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: ['table', 'Table'],
    model: ['dmeta.DataDesignerItemMetaExport']
  })
)
export class AppGraphTableWidget extends AppTreeMenuTableWidget {
  @Widget.Reactive()
  protected get treeConfig() {
    return { childrenField: 'children' } as any;
  }

  @Widget.Reactive()
  protected get paginationStyle(): ListPaginationStyle {
    return ListPaginationStyle.HIDDEN;
  }

  public async queryPage<T = ActiveRecord>(
    condition: Condition,
    pagination: Pagination,
    sort: ISort[],
    variables: QueryVariables,
    context: QueryContext
  ): Promise<QueryPageResult<T>> {
    return queryPage(
      this.model.model,
      {
        condition,
        sort,
        ...pagination
      },
      undefined,
      variables,
      {
        maxDepth: 2
      }
    );
  }
}
