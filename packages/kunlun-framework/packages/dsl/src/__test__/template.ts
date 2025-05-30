// 基础模板
export const baseTemplate = `
<view type="form">
    <element widget="actionBar" slot="actions" slotSupport="action"/>
    <element widget="form" slot="form">
        <xslot name="fields" slotSupport="pack,field"/>
    </element>
</view>
`;

//基础DSL
export const viewTemplate = `
<view type="form" model="xxx" name="viewExample">
    <template slot="actions">
        <action name="submit"/>
    </template>
    <template slot="fields">
        <pack widget="group">
            <field data="id"/>
            <field data="name" widget="string"/>
            <field data="code"/>
        </pack>
        <pack widget="tabs">
            <pack widget="tab" title="商品列表">
                <field data="items" />
            </pack>
            <pack widget="tab" title="子订单列表">
                <field data="orders" />
            </pack>
        </pack>
    </template>
</view>`;

// 基础合并结果
export const resultTemplate = `
<view type="form" model="xxx" name="viewExample">
    <element widget="actionBar" slot="actions" slotSupport="action">
        <action name="submit"/>
    </element>
    <element widget="form" slot="form">
        <slot name="fields" slotSupport="pack,field">
            <pack widget="group">
                <field data="id"/>
                <field data="name" widget="string"/>
                <field data="code"/>
            </pack>
            <pack widget="tabs">
                <pack widget="tab" title="商品列表">
                    <field data="items" />
                </pack>
                <pack widget="tab" title="子订单列表">
                    <field data="orders" />
                </pack>
            </pack>
        </slot>
    </element>
</view>`;

// 重复slot模板
export const repeatSlotTemplate = `
<view type="form">
    <element widget="actionBar" slot="actions"/>
    <element widget="fields" slot="fields"/>
    <element widget="actionBar" slot="actions"/>
</view>
`;

// 非法模板 必须存在slot
export const invalidSlotTemplate = `
<view type="form" model="xxx" name="viewExample">
    <template>
        <action name="submit"/>
    </template>
</view>`;

// 重复插槽View DSL
export const viewRepeatSlotTemplate = `
<view type="form" model="xxx" name="viewExample">
    <template slot="actions">
        <action name="submit"/>
    </template>
    <template slot="fields">
        <pack widget="group">
            <field data="id"/>
            <field data="name" widget="string"/>
            <field data="code"/>
        </pack>
        <pack widget="tabs">
            <pack widget="tab" title="商品列表">
                <field data="items" />
            </pack>
            <pack widget="tab" title="子订单列表">
                <field data="orders" />
            </pack>
        </pack>
    </template>
</view>`;

// 反向合并模板
export const baseReverseMergeTemplate = `
<view type="TABLE">
    <pack widget="group">
        <view type="SEARCH">
            <element widget="search" slot="search" />
        </view>
    </pack>
    <pack widget="group" slot="tableGroup">
        <element widget="actionBar" slot="actionBar">
            <xslot name="actions" />
        </element>
        <element widget="table" slot="table">
            <element widget="expandColumn" slot="expandRow" />
            <xslot name="fields" />
            <element widget="rowActions" slot="rowActions" />
        </element>
    </pack>
</view>
`;
// 反向合并DSL
export const reverseMergeDSLTemplate = `
<view type="TABLE" title="演示表格" name="演示模型table" model="demo.DemoModel">
    <template slot="table" sortable="true">
        <field data="id" invisible="true" />
        <field data="name" />
        <field data="isEnabled" />
        <template slot="rowActions">
            <action name="redirectUpdatePage" />
            <action name="enable" />
            <action name="disable" />
        </template>
    </template>
</view>`;
// 反向合并结果
export const reverseMergeResultTemplate = `<view type="TABLE" title="演示表格" name="演示模型table" model="demo.DemoModel">
    <pack widget="group">
        <view type="SEARCH">
            <element widget="search" slot="search" />
        </view>
    </pack>
    <pack widget="group" slot="tableGroup">
        <element widget="actionBar" slot="actionBar">
            <slot name="actions"></slot>
        </element>
        <element widget="table" slot="table" sortable="true">
            <field data="id" invisible="true" />
            <field data="name" />
            <field data="isEnabled" />
            <element widget="rowActions" slot="rowActions">
                <!-- slot="rowActions" -->
                <action name="redirectUpdatePage" />
                <action name="enable" />
                <action name="disable" />
            </element>
        </element>
    </pack>
</view>`;

// 获取插槽模板
export const fetchSlotTemplate = `
<view type="form" model="xxx" name="viewExample">
    <template slot="actions">
        <action name="submit"/>
    </template>
    <template slot="fields">
        <pack widget="group">
            <field data="id"/>
            <field data="name" widget="string"/>
            <field data="code"/>
        </pack>
    </template>
    <slot name="fields" slotSupport="field">
        <field data="id"/>
    </slot>
    <template isNotSlotAttr="true" />
    <pack>
        <field data="name"/>
    </pack>
</view> `;
//重复slot合并属性
export const hasRepeatSlotView = `
<view type="form" model="xxx" name="viewExample">
    <template slot="actions">
        <action name="submit"/>
    </template>
    <template slot="actions" isRepeat="true">
        <action name="reset"/>
    </template>
</view>`;
// 合并结果
export const mergeAttrResult = `
<view type="form" model="xxx" name="viewExample">
    <element widget="actionBar" slot="actions" slotSupport="action" isRepeat="true">
        <action name="submit"/>
        <action name="reset"/>
    </element>
    <element widget="form" slot="form">
        <slot name="fields" slotSupport="pack,field" />
    </element>
</view>`;
