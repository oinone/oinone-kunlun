import { DslDefinition, XMLParse } from '@oinone/kunlun-dsl';
import { ViewType } from '@oinone/kunlun-meta';
import { debugConsole } from '@oinone/kunlun-shared';

export function createDefaultLayout(viewType: ViewType, inline: boolean): DslDefinition | undefined {
  let xml: string | undefined;
  switch (viewType) {
    case ViewType.Table:
      if (inline) {
        xml = `<view type="TABLE">
    <view type="SEARCH">
        <element widget="search" slot="search" slotSupport="field">
            <xslot name="searchFields" slotSupport="field" />
        </element>
    </view>
    <element widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
    </element>
    <element widget="table" slot="table">
        <element widget="expandColumn" slot="expandRow" />
        <xslot name="fields" slotSupport="field" />
        <element widget="rowActions" slot="rowActions" />
    </element>
</view>`;
      } else {
        xml = `<view type="TABLE">
    <pack widget="group">
        <view type="SEARCH">
            <element widget="search" slot="search" slotSupport="field">
                <xslot name="searchFields" slotSupport="field" />
            </element>
        </view>
    </pack>
    <pack widget="group" slot="tableGroup">
        <element widget="actionBar" slot="actionBar" slotSupport="action">
            <xslot name="actions" slotSupport="action" />
        </element>
        <element widget="table" slot="table" slotSupport="field">
            <element widget="expandColumn" slot="expandRow" />
            <xslot name="fields" slotSupport="field" />
            <element widget="rowActions" slot="rowActions" slotSupport="action" />
        </element>
    </pack>
</view>`;
      }
      break;
    case ViewType.Form:
      if (inline) {
        xml = `<view type="FORM">
    <element widget="form" slot="form">
        <xslot name="fields" slotSupport="pack,field" />
    </element>
</view>`;
      } else {
        xml = `<view type="FORM">
    <element widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
    </element>
    <element widget="form" slot="form">
        <xslot name="fields" slotSupport="pack,field" />
    </element>
</view>`;
      }
      break;
    case ViewType.Detail:
      if (inline) {
        xml = `<view type="DETAIL">
    <element widget="detail" slot="detail">
        <xslot name="fields" slotSupport="pack,field" />
    </element>
</view>`;
      } else {
        xml = `<view type="DETAIL">
    <element widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
    </element>
    <element widget="detail" slot="detail">
        <xslot name="fields" slotSupport="pack,field" />
    </element>
</view>`;
      }
      break;
    case ViewType.Gallery:
      xml = `<view type="GALLERY">
    <view type="SEARCH">
        <element widget="search" slot="search" slotSupport="field">
            <xslot name="searchFields" slotSupport="field" />
        </element>
    </view>
    <element widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
    </element>
    <element widget="gallery" slot="gallery">
        <element widget="card" slot="card" slotSupport="pack,field" />
    </element>
</view>`;
      break;
    case ViewType.Tree:
      xml = `<view type="TREE">
    <pack widget="group">
        <view type="SEARCH">
            <element widget="search" slot="search" slotSupport="field">
                <xslot name="searchFields" slotSupport="field" />
            </element>
        </view>
    </pack>
    <pack widget="group">
        <element widget="actionBar" slot="actionBar" slotSupport="action">
            <xslot name="actions" slotSupport="action" />
        </element>
        <element widget="card-cascader" slot="tree" slotSupport="nodes,node" />
    </pack>
</view>`;
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
