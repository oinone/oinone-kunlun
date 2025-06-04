import { SPI } from '@oinone/kunlun-spi';
import { ViewWidget, Widget } from '@oinone/kunlun-vue-widget';
import { tableViewToGalleryView } from '../../tags';
import { RuntimeContext } from '@oinone/kunlun-engine';
import { Entity, IViewAction, ViewType } from '@oinone/kunlun-meta';
import { GalleryView, TableView } from '../view';
import { IQueryPageOption } from '@oinone/kunlun-service';
import { GalleryWidget } from '../gallery';
import { MetadataViewWidget } from '../../basic';
import { MobileViewWidget } from '../../layout';

const viewNameMap = {};
Object.entries({
  formView: ViewType.Form,
  detailView: ViewType.Detail,
  tableView: ViewType.Table,
  galleryView: ViewType.Gallery
}).forEach(([key, val]) => {
  viewNameMap[val] = key;
});

@SPI.ClassFactory(
  MobileViewWidget.Token({
    widget: 'keyword-search-view'
  })
)
export default class KeywordSearchMetadataViewWidget extends MetadataViewWidget {
  @Widget.Reactive()
  @Widget.Provide()
  protected formData;

  public initialize(props) {
    super.initialize({ ...props, inline: true });

    // FIXME df
    // this.metaViewNodeCode = this.getHandle();
    // this.isFetchData = true;
    // if (props.runtimeContext) {
    //   const runtimeContext = props.runtimeContext as RuntimeContext;
    //
    //   const mainViewWidgetConfig = {
    //     operation: true,
    //     isRootWidget: false,
    //     isRootView: false,
    //     sortable: false,
    //   } as Entity;
    //
    //   const metaDsl = {
    //     ...this.createMetaDsl(runtimeContext),
    //     mainViewWidgetConfig
    //   } as IMetaDsl;
    //   this.initView(metaDsl);
    //   this.model = runtimeContext.model;
    // }
    return this;
  }

  protected createMetaDsl(runtimeContext: RuntimeContext) {
    return {
      isRoot: false,
      isBatchOpt: true,
      model: runtimeContext.model.model,
      modelName: runtimeContext.model.name,
      resModel: runtimeContext.model.model,
      viewType: runtimeContext.view.type,
      resModelDefinition: {
        name: ''
      },
      resModuleDefinition: {
        name: ''
      },
      resView: {
        name: viewNameMap[runtimeContext.view.type],
        template: runtimeContext.view.dsl
      }
    } as unknown as IViewAction;
  }

  public setCurrentPage(currentPage = 1) {
    const runtimeContext = this.runtimeContext;
    // const { type: viewType } = runtimeContext.viewTemplate;
    // if (viewType === ViewType.Table) {
    //   const tableView = this.getBaseViewWidget() as unknown as TableView;
    //   if (tableView) {
    //     const tableWidget = tableView.getMainViewWidget() as unknown as MobileTableWidget;
    //     tableWidget?.fetchData([], {currentPage} as IQueryPageOption);
    //   }
    // } else if (viewType === ViewType.Gallery) {
    //   const galleryView = this.getBaseViewWidget() as unknown as GalleryView;
    //   if (galleryView) {
    //     const galleryWidget = galleryView.getMainViewWidget() as unknown as GalleryWidget;
    //     galleryWidget?.onPaginationChange(currentPage);
    //   }
    // }
  }

  @Widget.Reactive()
  public dataLength = 0;

  public setDataLength(length: number) {
    this.dataLength = length;
    this?.changeDataLength?.(length);
  }

  @Widget.Method()
  @Widget.Inject()
  public changeDataLength;

  @Widget.Method()
  @Widget.Inject()
  public changeKeywordSearching;

  public async searchByDomain(domain: string) {
    const runtimeContext = this.runtimeContext;
    // const { type: viewType } = runtimeContext.viewTemplate;
    // if (viewType === ViewType.Table) {
    //   const tableView = this.getBaseViewWidget() as unknown as TableView;
    //   if (tableView) {
    //     const tableWidget = tableView.getMainViewWidget() as unknown as MobileTableWidget;
    //     tableWidget?.setDomain(domain);
    //     this.changeKeywordSearching(true);
    //     const list = await tableWidget?.fetchData();
    //     this.changeKeywordSearching(false);
    //     this.setDataLength(list.length);
    //   }
    // } else if (viewType === ViewType.Gallery) {
    //   const galleryView = this.getBaseViewWidget() as unknown as GalleryView;
    //   if (galleryView) {
    //     const galleryWidget = galleryView.getMainViewWidget() as unknown as GalleryWidget;
    //     galleryWidget?.setDomain(domain);
    //     this.changeKeywordSearching(true);
    //     await galleryWidget?.refreshFetchData();
    //     this.changeKeywordSearching(false);
    //     this.setDataLength(galleryWidget?.getDataSource()?.length!);
    //   }
    // }
  }

  public initView(metaDsl: IViewAction) {
    // metaDsl.baseViewWidgetHandleChange = (baseViewWidgetHandle) => {
    //   this.baseViewWidgetHandle = baseViewWidgetHandle;
    // };
    // tableViewToGalleryView(metaDsl);
    // const runtimeContext = createRuntimeContextByMetaDsl(metaDsl, this.metaViewNodeCode);
    // this.runtimeContext = runtimeContext;
    //
    // const { view, viewLayout, viewDsl, viewTemplate } = runtimeContext;
    // this.modelModel = view.model;
    // this.modelName = view.modelName;
    // this.moduleName = view.moduleName;
    // this.viewLayout = viewLayout;
    // this.viewDsl = viewDsl;
    // this.viewTemplate = viewTemplate;
    // this.viewType = view.type;
  }
}
