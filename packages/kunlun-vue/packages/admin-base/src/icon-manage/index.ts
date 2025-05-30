import { ViewType } from '@kunlun/meta';
import { LayoutManager } from '../spi';

LayoutManager.register(
  {
    viewType: ViewType.Gallery,
    moduleName: 'resource',
    model: 'resource.ResourceIcon',
    actionName: 'resource#图标管理'
  },
  `<view type='GALLERY'>
    <pack widget='group'>
      <view type='SEARCH'>
        <element widget='iconSearch' slot='search'>
          <template slot='actions' />
        </element>
      </view>
    </pack>
    <element widget='IconManageGallery' slot='gallery'>
      <template slot='rowActions' />
    </element>
</view>`
);

// model带修改 一个图标管理，一个图标上传
LayoutManager.register(
  {
    viewType: ViewType.Gallery,
    moduleName: 'resource',
    model: 'resource.ResourceIcon',
    actionName: 'iconUploadAction'
  },
  `<view type='GALLERY'>
      <element widget='iconUploadGallery' slot='gallery'>
        <template slot='rowActions' />
      </element>
  </view>`
);

export * from './action';
export * from './components';
export * from './field/IconGroupSelectWidget';
export * from './service/IconManageService';
export * from './view';
