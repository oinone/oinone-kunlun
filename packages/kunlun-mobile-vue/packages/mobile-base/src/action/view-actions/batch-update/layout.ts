import { ViewType } from '@kunlun/meta';
import { registerLayout } from '../../../spi';

registerLayout(
  `<view type="FORM">
  <element widget="form" slot="form">
    <xslot name="fields" slotSupport="pack,field" />
  </element>
  <pack title="待提交数据" slot="tableGroup">
    <view type="TABLE" datasource-clone="true">
      <element widget="table" checkbox="false" slot="table" slotSupport="field" />
    </view>
  </pack>
</view>
`,
  { viewType: ViewType.Form, inline: true, actionWidget: 'BatchUpdate' }
);
