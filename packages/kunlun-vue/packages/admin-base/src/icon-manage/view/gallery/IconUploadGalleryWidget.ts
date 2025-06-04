import { ActiveRecord, genStaticPath, Pagination, QueryPageResult, translateValueByKey } from '@oinone/kunlun-engine';
import { PluginsLoader, ViewType } from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import { Matched, useMatched } from '@oinone/kunlun-router';
import { SPI } from '@oinone/kunlun-spi';
import { OioMessage } from '@oinone/kunlun-vue-ui-antd';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementListViewWidget, BaseElementWidget } from '../../../basic';
import { IconGroup, IconUpload, iconZipUpload, queryIconsWithCondition } from '../../service/IconManageService';
import { UploadStatus } from '../../typing';
import IconUploadGallery from './IconUploadGallery.vue';

const LastUploadKey = 'LastIconUploadGroup';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: 'iconUploadGallery'
  })
)
export class IconUploadGalleryWidget extends BaseElementListViewWidget {
  private prevMatched: Matched | null | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(IconUploadGallery);
    return this;
  }

  @Widget.Reactive()
  public uploadStatus: UploadStatus = UploadStatus.NoData;

  @Widget.Reactive()
  public currentGroup: IconGroup | undefined = undefined;

  public setUploadStatus(status: UploadStatus) {
    this.uploadStatus = status;
  }

  @Widget.Reactive()
  protected get limitSize(): number {
    return this.getDsl().limitSize || 10;
  }

  @Widget.Method()
  protected get accept(): string {
    return this.getDsl().accept || '.zip';
  }

  @Widget.Method()
  protected reject(fileList) {
    OioMessage.error(translateValueByKey('仅支持.zip文件'));
  }

  @Widget.Method()
  protected beforeUpload(file, fileList): boolean {
    const names = file.name.split('.') as string[];
    const type = `.${names.slice(-1)}`;
    let accepts;
    if (typeof this.accept === 'string') {
      accepts = this.accept.split(',');
    }
    if (Array.isArray(this.accept)) {
      accepts = this.accept;
    }

    accepts = accepts.map((v) => v.toLocaleLowerCase());
    if (accepts && !accepts.includes(type.toLocaleLowerCase())) {
      this.reject(fileList);
      return false;
    }

    this.setUploadStatus(UploadStatus.Uploading);
    this.reloadDataSource([]);
    return true;
  }

  /**
   * 空数据提示
   */
  @Widget.Reactive()
  protected get emptyText() {
    switch (this.uploadStatus) {
      case UploadStatus.NoData:
        return this.getDsl().emptyText || translateValueByKey('暂无数据');
      case UploadStatus.Uploading:
        return translateValueByKey('图标文件正在上传');
      case UploadStatus.Parsing:
        return translateValueByKey('图标文件正在解析，请耐心等待');
      case UploadStatus.Fail:
        return translateValueByKey('未检测到已上传图标文件');
      case UploadStatus.ShowData:
        return this.getDsl().emptyText || translateValueByKey('暂无数据');

      default:
        break;
    }
  }

  /**
   * 空数据图片
   */
  @Widget.Reactive()
  protected get emptyImage() {
    switch (this.uploadStatus) {
      case UploadStatus.NoData:
        return this.getDsl().emptyImage || undefined;
      case UploadStatus.Uploading:
        return genStaticPath('icon-manage/icon-manage-uploding-2x.png');
      case UploadStatus.Parsing:
        return genStaticPath('icon-manage/icon-manage-uploding-2x.png');
      case UploadStatus.Fail:
        return this.getDsl().emptyImage || undefined;
      case UploadStatus.ShowData:
        return this.getDsl().emptyImage || undefined;

      default:
        break;
    }
    return this.getDsl().emptyImage || undefined;
  }

  // 图标上传页面的切换分组
  @Widget.Method()
  protected async onChangeWidgetGroup(g: IconGroup) {
    if (this.currentGroup?.id === g.id) {
      return;
    }
    this.currentGroup = g;

    const pagination = this.generatorPagination();
    pagination.current = 1;
    let res;

    await this.load(async () => {
      res = await queryIconsWithCondition({
        model: this.rootRuntimeContext.model.moduleName,
        pagination: { current: pagination.current, pageSize: pagination.pageSize } as Pagination,
        condition: `(1==1) and (((1==1) and (groupId=='${this.currentGroup?.id}')) and (libId=='${this.currentGroup?.libId}'))`
      });
    });

    if (res) {
      pagination.total = Number(res.totalElements);
      pagination.totalPageSize = Number(res.totalPages);

      const dataSource = res.content;

      this.reloadDataSource(dataSource);
      this.reloadActiveRecords([]);
    }
  }

  @Widget.Reactive()
  protected manageGroupList: IconGroup[] = [];

  public setManageGroupList(groups: IconGroup[]) {
    if (groups && groups.length) {
      this.manageGroupList.splice(0, this.manageGroupList.length);
      this.manageGroupList.push(...groups);
    }
  }

  protected queryTimes = 0;

  public async queryPage<T = ActiveRecord>(condition: Condition, pagination: Pagination): Promise<QueryPageResult<T>> {
    this.queryTimes++;
    if (this.queryTimes === 1) {
      this.reloadLocalStroageGroups(LastUploadKey);
      return {
        totalElements: 0,
        totalPages: 0,
        content: []
      };
    }
    const res = await queryIconsWithCondition({
      model: 'resource',
      pagination,
      condition: `(1==1) and ((1==1) and (groupId=='${this.currentGroup?.id}'))`
    });
    if (res) {
      return {
        totalElements: Number(res.totalElements),
        totalPages: Number(res.totalElements),
        content: res.content as any
      };
    }
    return {
      totalElements: 0,
      totalPages: 0,
      content: []
    };
  }

  @Widget.Method()
  protected async onFileUpload(urls: string[]) {
    this.setUploadStatus(UploadStatus.Parsing);
    this.currentGroup = undefined;
    let uploads: IconUpload[] | undefined = [];
    try {
      await this.load(async () => {
        uploads = await iconZipUpload({
          model: 'resource',
          urls
        });
      });
      if (uploads && uploads.length) {
        this.setGroup(uploads);
        this.setLocalStroageGroups(this.manageGroupList);
        this.onChangeWidgetGroup(this.manageGroupList?.[0]);
        uploads?.forEach((iconUpload) => {
          const mounted = {
            js: iconUpload.jsUrls,
            css: iconUpload.cssUrls
          };
          PluginsLoader.load({ mounted });
        });
        this.uploadStatus = UploadStatus.ShowData;
      } else {
      }
    } catch (error) {
      this.uploadStatus = UploadStatus.Fail;
    }
  }

  public setGroup(data: IconUpload[]) {
    const finalGroup: IconGroup[] = [];
    data.forEach((value) => {
      const libId = value.libId;
      value.iconGroupList.forEach((group) => {
        group && finalGroup.push({ ...group, libId });
      });
    });
    this.setManageGroupList(finalGroup);
  }

  public reloadLocalStroageGroups(key: string) {
    const groups = localStorage.getItem(key);
    const finalGroup = groups ? (JSON.parse(groups) as IconGroup[]) : [];
    if (finalGroup.length) {
      this.uploadStatus = UploadStatus.ShowData;
      this.setManageGroupList(finalGroup);
      this.onChangeWidgetGroup(finalGroup[0]);
    }
  }

  public setLocalStroageGroups(groups: IconGroup[]) {
    localStorage.setItem(LastUploadKey, JSON.stringify(groups));
  }

  public clearLocalStorageGroups() {
    localStorage.removeItem(LastUploadKey);
  }

  protected $$mounted() {
    super.$$mounted();
    this.prevMatched = useMatched().prevMatched;
    if (this.prevMatched) {
      this.clearLocalStorageGroups();
    }
  }
}
