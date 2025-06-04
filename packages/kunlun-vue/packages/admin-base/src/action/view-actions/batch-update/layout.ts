import { ViewType } from '@oinone/kunlun-meta';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { LayoutManager } from '../../../spi';

LayoutManager.register(
  {
    viewType: ViewType.Form,
    inline: true,
    actionWidget: 'BatchUpdate'
  },
  `<view type="FORM">
  <element widget="form" slot="form">
    <xslot name="fields" slotSupport="pack,field" />
  </element>
  <pack title="${translateValueByKey('待提交数据')}" slot="tableGroup">
    <view type="TABLE" datasource-clone="true">
      <element widget="table" checkbox="false" slot="table" slotSupport="field" />
    </view>
  </pack>
</view>`
);
