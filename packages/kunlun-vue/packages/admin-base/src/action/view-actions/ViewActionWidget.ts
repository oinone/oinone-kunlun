import { RuntimeViewAction } from '@oinone/kunlun-engine';
import { ActionType, IDslNode } from '@oinone/kunlun-meta';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { ClickResult } from '../../typing';
import { ActionWidget } from '../component';

@SPI.ClassFactory(
  ActionWidget.Token({
    actionType: ActionType.View
  })
)
export class ViewActionWidget extends ActionWidget<RuntimeViewAction> {
  public initialize(config) {
    super.initialize(config);
    return this;
  }

  /**
   * @description 根据当前action对应的api xml配置，获取`跳转/打开弹窗`的时候要带上的条件
   * 如果当前action的queryType是domain
   *  就传递domain
   *
   * 如果当前action的queryType是list，
   *  就根据xml配置传递`数组对象` [{id: 'xxx', name: 'xxx', user: {name: 'xxx',age: 'xxx'}},{id: 'xxx', name: 'xxx', user: {name: 'xxx',age: 'xxx'}}]
   *
   * 如果当前action的queryType是object，
   *  就根据xml配置传递`对象` {id: 'xxx', name: 'xxx', user: {name: 'xxx',age: 'xxx'}}
   *
   *
   * @example by xml
   *
   * <action refs="xxxx" displayName="启动" loadApi="load">
   *   <api>
   *     <request>
   *      <field name="id">${activeRecord.id}</field>
   *      <field name="name">${activeRecord.name}</field>
   *      <field name="user">
   *        <field name="name">${activeRecord.user.name}</field>
   *        <field name="age">${activeRecord.user.age}</field>
   *      </field>
   *     </request>
   *   </api>
   * </action>
   *
   *
   */
  // protected structureViewCondition() {
  //   const { queryType: globalQueryType } = GlobalConfig.getConfig();
  //
  //   let queryType!: QueryType;
  //
  //   const actionQueryType = this.action.queryType;
  //   const actionApiProtocol = this.action.apiProtocol;
  //
  //   /**
  //    * 1. 如果当前的action有queryType，那么直接去取action的queryType
  //    * 2. 如果当前action有apiProtocol， 就根据apiProtocol来决定queryType的值
  //    * 3. 如果以上都不成立，就取全局配置 || domain
  //    */
  //   if (actionQueryType) {
  //     queryType = actionQueryType;
  //   } else if (actionApiProtocol) {
  //     queryType = ApiProtocol.GRAPHQL ? QueryType.DOMAIN : QueryType.OBJECT;
  //   } else {
  //     queryType = (globalQueryType as QueryType) || QueryType.DOMAIN;
  //   }
  //
  //   if (queryType === QueryType.DOMAIN) {
  //     return this.actionDomain
  //       ? {
  //           queryType: QueryType.DOMAIN,
  //           value: this.actionDomain
  //         }
  //       : false;
  //   }
  //
  //   const { loadApi } = this.getDsl();
  //
  //   if (!loadApi) {
  //     return false;
  //   }
  //
  //   const actionName = this.action?.displayName || this.action?.name;
  //
  //   const apiNode = new XMLTemplateParser().findKey(this.getDsl(), 'tagName', 'API');
  //   if (!apiNode) {
  //     return false;
  //   }
  //
  //   const requestNode = new XMLTemplateParser().findKey(this.getDsl(), 'tagName', ElementType.REQUEST);
  //   if (!requestNode) {
  //     throw new Error(`${actionName} action has loadApi function, but not request configuration`);
  //   }
  //
  //   const apiChildren = this.getDsl().children.find((a) => a.tagName === ElementType.API)!.children;
  //   const requestChildren = apiChildren.find((a) => a.tagName === ElementType.REQUEST)!.children;
  //
  //   const condition = {};
  //
  //   // resolveChildrenCondition函数内部，会给 `condition` 赋值
  //   this.resolveChildrenCondition(condition, requestChildren);
  //
  //   if (queryType === QueryType.OBJECT) {
  //     const result = parseExpressionData(condition, this.activeRecords?.[0] || {}, this.rootData);
  //     return {
  //       queryType: QueryType.OBJECT,
  //       value: result,
  //       loadApi
  //     };
  //   }
  //
  //   if (queryType === QueryType.LIST) {
  //     const result = this.activeRecords?.map((activeRecord) =>
  //       parseExpressionData(condition, activeRecord, this.rootData)
  //     );
  //
  //     return {
  //       queryType: QueryType.LIST,
  //       value: result,
  //       loadApi
  //     };
  //   }
  // }

  /**
   * 将xml中的aip配置，解析成 key -> value形式的对象，
   * 如果value是个表达式，那么会原封不动的返回，该函数不处理表达式，只做转换
   *
   * @param {Object} parentCondition 外层的对象
   * @param {IDslNode[]} childrenDsl
   *
   * @returns {void}
   */
  private resolveChildrenCondition(parentCondition: Record<string, any>, childrenDsl: IDslNode[]) {
    childrenDsl.forEach((field) => {
      if (field.children && field.children.length) {
        parentCondition[field.name!] = {};
        this.resolveChildrenCondition(parentCondition[field.name!], field.children);
      } else {
        const textContent = field.textContent || null;
        parentCondition[field.name!] = textContent;
      }
    });
  }

  protected clickAction(): ReturnPromise<ClickResult> {
    this.$router?.push({
      segments: [
        {
          path: 'page',
          parameters: { scene: this.action && this.action.name },
          extra: { preserveParameter: true }
        }
      ]
    });
    return true;
  }
}
