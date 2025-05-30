import { HttpClient } from '@kunlun/request';
import { translateValueByKey } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../basic';

import TechVisualization from './TechVisualization.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'TechVisualizationWidget' }))
export class TechVisualizationWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(TechVisualization);
    return this;
  }

  @Widget.Reactive()
  private dataList = [];

  @Widget.Reactive()
  private title = translateValueByKey('全平台技术架构');

  public setTitle(title: string) {
    this.title = title;
  }

  public async fetchData() {
    const http = HttpClient.getInstance();
    const body = `
                  query{
                    techniqueViQuery {
                      fetchDetail(data: {}) {
                        iPaaSList {
                          name
                          value
                          position
                          code
                        }
                        uiPaaSList {
                          name
                          value
                          position
                          code
                        }
                        hpaPaaSList {
                          name
                          value
                          position
                          code
                        }
                        aPaaSList {
                          name
                          value
                          position
                          code
                        }
                      }
                    }
                  }
                `;

    const result = (await http.query('apps', body)) as any;
    this.dataList = result.data.techniqueViQuery.fetchDetail;

    return this.dataList;
  }

  mounted() {
    this.fetchData();
  }
}
