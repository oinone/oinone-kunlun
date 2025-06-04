import { Condition, HttpClient } from '@oinone/kunlun-request';
import { useMatched } from '@oinone/kunlun-router';
import { getModel } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { MaskWidget } from '../../basic';

import OrderStatisticComponent from './OrderStatistic.vue';

interface IData {
  name: string;
  displayName: string;
  value: string;
}

const ModelName = 'libra.trade.LibraOrderQuantityCalculate';

@SPI.ClassFactory(MaskWidget.Token({ widget: 'order-statistic' }))
export class OrderStatistic extends MaskWidget {
  @Widget.Reactive()
  private layoutTemplate = '';

  @Widget.Reactive()
  private showFields: string[] = [];

  @Widget.Reactive()
  private showData: IData[] = [];

  @Widget.Reactive()
  private activedModel = '';

  private http = HttpClient.getInstance();

  public initialize(props) {
    const { dslNode } = props;

    const { fields = '' } = dslNode;
    this.showFields = (fields as string).split(',').filter((v) => v);

    super.initialize(props);
    this.setComponent(OrderStatisticComponent);
    return this;
  }

  @Widget.Method()
  public async mounted() {
    const page = useMatched().matched.segmentParams.page;
    this.activedModel = page.model || '';
    await this.loadData('', page.scene || '');

    useMatched()
      .getMatched$()
      .subscribe((val) => {
        const { searchBody, scene } = val.segmentParams.page;

        if (searchBody) {
          const condition = new Condition('1==1');
          condition.and(this.buildSearchConditions(JSON.parse(searchBody)));

          this.loadData(condition.toString() === '1==1' ? '' : condition, scene);
        }
      });
  }

  @Widget.Method()
  private async loadData(condition, scene) {
    if (!this.showFields.length) {
      return;
    }

    try {
      const result = await this.queryData(condition, scene);
      const model = await getModel(ModelName);
      this.showData = this.showFields.map((f) => {
        const displayName = (model.modelFields.find((m) => m.name === f) || {}).displayName;
        return {
          displayName,
          name: f,
          value: result[f]
        };
      }) as any;
    } catch (error) {
      console.error(error);
    }
  }

  @Widget.Method()
  private async queryData(condition, scene) {
    const queryFields = this.showFields.join('\n');

    const body = `
      query{
        libraDeliveryOrderQuery{
          calculateQuantity(calculate:{modelModel:"${this.activedModel}", rsql:"${condition}"}){
             ${queryFields}
          }
        }
      }
    `;

    const result = await this.http.query('base', body, undefined, {
      __queryParams: { scene }
    });
    return result.data.libraDeliveryOrderQuery.calculateQuantity;
  }

  @Widget.Method()
  public buildSearchConditions(content: Record<string, unknown>) {
    const { page } = useMatched().matched.segmentParams;
    const extraConditions: { leftValue: string[]; operator: string; right: unknown }[] =
      (page.searchConditions && JSON.parse(decodeURIComponent(page.searchConditions))) || [];
    const extraContent: Record<string, unknown> =
      (page.searchBody && JSON.parse(decodeURIComponent(page.searchBody))) || {};

    const condition = new Condition('1==1');
    const mixedContent = { ...content, ...extraContent };
    Object.keys(mixedContent).forEach((c) => {
      if (mixedContent[c] !== null && mixedContent[c] !== undefined && mixedContent[c] !== '') {
        const val = mixedContent[c];
        if (typeof val === 'string') {
          condition.and(new Condition(c).equal(mixedContent[c] as string));
        }
      }
    });
    extraConditions
      .map((c) => {
        if (c.operator === '=like=' || c.operator === '=notlike=') {
          return { ...c, right: `%${c.right}%` };
        }
        return c;
      })
      .forEach((con) => {
        const left = con.leftValue[con.leftValue.length - 1];
        if (con.operator !== 'between') {
          condition.and(new Condition(left).append(con.operator).append(new Condition(con.right as string).toString()));
        } else {
          condition.and(
            new Condition(left)
              .greaterThanOrEuqalTo((<string[]>con.right)[0])
              .and(new Condition(left).lessThanOrEqualTo((<string[]>con.right)[1]))
          );
        }
      });
    return condition;
  }
}
