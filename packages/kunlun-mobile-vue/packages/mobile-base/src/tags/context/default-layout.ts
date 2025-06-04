import { DslDefinition, XMLParse } from '@oinone/kunlun-dsl';
import { ViewType } from '@oinone/kunlun-meta';
import { DEFAULT_VIEW_CLASS } from '../../ui/theme';
import { debugConsole } from '@oinone/kunlun-shared';

export function createMobileDefaultLayout(viewType: ViewType, inline: boolean): DslDefinition | undefined {
  let xml: string | undefined;
  switch (viewType) {
    case ViewType.Table:
      if (inline) {
        xml = `
<view type="TABLE">
    <view type="SEARCH">
        <element widget="search" slot="search" slotSupport="field" />
    </view>
    <element widget="actionBar" slot="actionBar" slotSupport="action">
      <xslot name="actions" slotSupport="action" />
    </element>
    <pack widget="group" style="height: 100%;flex: 1;overflow-y: hidden;" wrapperStyle="height: 100%;box-sizing:border-box;">
      <pack widget="row" style="height: 100%;">
        <pack widget="col" mode="full" style="min-height: 234px;height: 100%;">
          <element widget="table" slot="table">
              <xslot name="fields" slotSupport="field" />
              <element widget="rowActions" slot="rowActions" />
          </element>
        </pack>
      </pack>
    </pack>
</view>`;
      } else {
        xml = `
<view type="TABLE">
    <view type="SEARCH">
        <element widget="search" slot="search" slotSupport="field">
            <xslot name="searchFields" slotSupport="field" />
        </element>
    </view>
    <pack widget="group" class="${DEFAULT_VIEW_CLASS}" style="height: 100%;flex: 1;overflow-y: hidden;" wrapperStyle="height: 100%;box-sizing:border-box;">
      <pack widget="row" style="height: 100%;">
        <pack widget="col" mode="full" style="min-height: 234px;height: 100%;">
          <element widget="table" slot="table" slotSupport="field" checkbox="false">
              <xslot name="fields" slotSupport="field" />
              <element widget="rowActions" slot="rowActions" />
          </element>
        </pack>
      </pack>
    </pack>
    <element widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
    </element>
</view>`;
      }
      break;
    case ViewType.Form:
      if (inline) {
        xml = `
<view type="FORM">
    <element widget="form" slot="form">
        <xslot name="fields" slotSupport="pack,field" />
    </element>
</view>`;
      } else {
        xml = `
<view type="FORM">
    <element widget="form" slot="form">
        <xslot name="fields" slotSupport="pack,field" />
    </element>

    <element widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
    </element>
</view>`;
      }
      break;
    case ViewType.Detail:
      if (inline) {
        xml = `
<view type="DETAIL">
    <element widget="detail" slot="detail">
        <xslot name="fields" slotSupport="pack,field" />
    </element>
</view>`;
      } else {
        xml = `
<view type="DETAIL">
    <element widget="detail" slot="detail">
        <xslot name="fields" slotSupport="pack,field" />
    </element>
    <element widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
    </element>
</view>`;
      }
      break;
    case ViewType.Gallery:
      if (inline) {
        xml = `
<view type="GALLERY">
    <element widget="gallery" slot="gallery">
        <pack widget="card" slot="card" slotSupport="pack,field" />
    </element>
    <element widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
    </element>
</view>
`;
      } else {
        xml = `
<view type="GALLERY">
    <view type="SEARCH">
        <element widget="search" slot="search" slotSupport="field">
            <xslot name="searchFields" slotSupport="field" />
        </element>
    </view>
    <element widget="gallery" slot="gallery">
        <pack widget="card" slot="card" slotSupport="pack,field" />
    </element>
    <element widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
    </element>
</view>
`;
      }
      break;
    default:
      break;
  }
  debugConsole.log('使用默认layout', xml);
  if (!xml) {
    return undefined;
  }

  return XMLParse.INSTANCE.parse(xml);
}
