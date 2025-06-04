import { watch, nextTick } from 'vue';

import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ActiveRecord, Pagination } from '@oinone/kunlun-engine';
import { ListPaginationStyle } from '@oinone/kunlun-vue-ui-antd';

import { BaseElementWidget, FormFieldWidget } from '../../../basic';
import Component from './Component.vue';
import { TableWidget } from '../../table';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'ImportAndExportElement' }))
export class ImportAndExportElement extends BaseElementWidget {
  public initialize(props) {
    if (!props.slotNames) {
      props.slotNames = ['default', 'action'];
    }

    super.initialize(props);

    this.setComponent(Component);
    return this;
  }

  @Widget.Reactive()
  protected tableWidgetLength = 0;

  protected tableWidgetList: TableWidget[] = [];

  @Widget.Reactive()
  protected paginationList: Pagination[] = [];

  @Widget.Reactive()
  protected fieldActiveRecord: Map<string, ActiveRecord[]> = new Map();

  @Widget.Reactive()
  protected get total() {
    return this.paginationList.reduce((total, pagination, index) => {
      const widget = this.tableWidgetList[index];
      const treeConfig = (widget as any)?.treeConfig || {};
      if (treeConfig.childrenField && widget.getPaginationStyle() === ListPaginationStyle.HIDDEN) {
        return total + this.getTotalLength(widget.getData() || []);
      }

      return total + pagination.total;
    }, 0);
  }

  @Widget.Reactive()
  protected get selectedLength() {
    let len = 0;
    this.fieldActiveRecord.forEach((a) => {
      len += a.length;
    });
    return len;
  }

  protected needExecuteRecordChange: boolean[] = [];

  protected getTotalLength(arr: any[]) {
    let length = arr.length;

    arr.forEach((item) => {
      if (item.children && item.children.length > 0) {
        length += this.getTotalLength(item.children);
      }
    });

    return length;
  }

  protected setCheckboxRow(activeRecords: ActiveRecord[], tableWidgetIndex: number) {
    // 等接口调用完毕再执行
    const stop = watch(
      () => this.tableWidgetList[tableWidgetIndex].getData()?.map((activeRecord) => activeRecord.id),
      async () => {
        await nextTick();
        this.needExecuteRecordChange[tableWidgetIndex] = false;
        const idMap = new Map(activeRecords.map((a) => [a.id, true]));
        const data = this.tableWidgetList[tableWidgetIndex].getData()?.filter((d) => idMap.get(d.id));
        data?.length && this.tableWidgetList[tableWidgetIndex].getTableInstance()!.setCheckboxRow(data, true);

        stop();
      }
    );
  }

  /**
   * 监听表格分页切换、表格搜索
   *  需要选中对应的check
   */
  watchPaginationAndSearch() {
    const trySetCheckboxRow = (fieldData: string, tableWidgetIndex: number) => {
      const value = this.fieldActiveRecord.get(fieldData);
      if (value && value.length) {
        this.setCheckboxRow(value, tableWidgetIndex);
      }
    };

    this.paginationList.forEach((p, index) => {
      watch(
        () => {
          return {
            current: p.current,
            size: p.pageSize
          };
        },
        ({ current, size }) => {
          const tableWidget = this.tableWidgetList[index];
          const fieldWidget = tableWidget.getParentWidget()?.getParentWidget() as FormFieldWidget;
          trySetCheckboxRow(fieldWidget.field.data, index);
        }
      );
    });

    this.tableWidgetList.forEach((table, index) => {
      watch(
        () => (table as any).searchCondition,
        () => {
          const tableWidget = this.tableWidgetList[index];
          const fieldWidget = tableWidget.getParentWidget()?.getParentWidget() as FormFieldWidget;
          trySetCheckboxRow(fieldWidget.field.data, index);
        },
        {
          deep: true
        }
      );
    });
  }

  /**
   * 监听表格选中行变化
   */
  watchTableActiveRecords() {
    this.tableWidgetList.forEach((tableWidget, index) => {
      const fieldWidget = tableWidget.getParentWidget()?.getParentWidget() as FormFieldWidget;
      watch(
        () => tableWidget.activeRecords?.length,
        () => {
          if (!this.needExecuteRecordChange[index]) {
            this.needExecuteRecordChange[index] = true;
            return;
          }

          const data = fieldWidget.field.data;

          if (!this.fieldActiveRecord.has(data)) {
            this.fieldActiveRecord.set(data, []);
          }

          const fieldActiveRecords = this.fieldActiveRecord.get(data) || [];

          const activeRecords = [...(tableWidget.activeRecords || [])];

          const ids = activeRecords.map((a) => a.id);

          const excludeIds = tableWidget
            .getData()
            ?.filter((d) => !ids.includes(d.id))
            .map((d) => d.id);

          fieldActiveRecords.push(...activeRecords);

          const uniqueArray = fieldActiveRecords.reduce((acc, current) => {
            const x = acc.find((item) => item.id === current.id);
            if (!x && !excludeIds?.includes(current.id)) {
              acc.push(current);
            }
            return acc;
          }, [] as ActiveRecord[]);

          this.fieldActiveRecord.set(data, uniqueArray);
        }
      );
    });
  }

  /**
   * 找当前视图中对应的TableWidget
   */
  protected findTableWidget(widget: Widget) {
    let result: TableWidget[] = [];
    let stack = [widget];

    while (stack && stack.length > 0) {
      let current = stack.pop()!;

      if (current instanceof TableWidget) {
        result.push(current);
      }

      if (current.getChildrenInstance()?.length) {
        for (let child of current.getChildrenInstance()) {
          stack.push(child);
        }
      }
    }

    return result;
  }

  mounted() {
    const [detail] = this.getChildrenInstance();

    const tableWidgets = this.findTableWidget(detail);

    this.tableWidgetLength = tableWidgets.length;

    if (tableWidgets.length) {
      this.tableWidgetList = tableWidgets;
      tableWidgets.forEach((t) => {
        this.paginationList.push(t.getPagination());

        const fieldWidget = t.getParentWidget()?.getParentWidget() as FormFieldWidget;
        const data = fieldWidget.field.data;

        if (data) {
          this.fieldActiveRecord.set(data, []);
        }
      });

      this.watchPaginationAndSearch();
      this.watchTableActiveRecords();
    }
  }
}
