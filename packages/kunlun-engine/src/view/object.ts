import { constructOne, insertOne, queryOne, updateOne } from '@kunlun/service';
import { ActionElement } from '@kunlun/meta';

import { IObjectValue, IBaseObjectProps } from '../typing/interface';
import { ViewVM } from './view';
import { customMutationByApi } from '../helper/dataParse';

// TODO Object还需要接管下级字段、校验、表达式

/**
 * Object 形态的视图，管理着数据源跟元数据以及Object形态下面的字段，以及「增、改」方法，方法允许被重写
 *
 */
export class ObjectVM<P extends IBaseObjectProps = IBaseObjectProps> extends ViewVM<IObjectValue, P> {
  protected viewData: IObjectValue = {} as IObjectValue;

  /**
   * 加载接口数据
   *
   * @param {array} content 请求参数,默认取content中的第一项，如果有id，那么会触发`queryOne`，否则是 `constructOne`
   * @param {object} options 可以配置查询层级 {maxDepth: 1},  层级默认是从0开始
   * @param {object} variables
   */
  public async fetchData(
    content: Record<string, unknown>[] = [],
    options: Record<string, unknown> = {},
    variables: Record<string, unknown> = {}
  ) {
    try {
      this.setBusy(true);

      const reqData = content[0] || {};
      let data: IObjectValue = {};

      if (reqData.id) {
        data = (await queryOne(
          this.model!.model,
          (content[0] || {}) as Record<string, string>,
          undefined,
          variables,
          options
        )) as Record<string, unknown>;
      } else {
        // data = await constructOne(this.model!.model, reqData, undefined, variables, options);
      }

      this.loadData(data);

      return this.getData();
    } catch (error) {
      console.error(error);
    } finally {
      this.setBusy(false);
    }
  }

  /**
   * 设置`viewData` 数据
   */
  public loadData(content: Record<string, unknown>) {
    if (Array.isArray(content)) {
      content = content[0];
    }
    Object.keys(content || {}).forEach((name) => (this.viewData[name] = content[name]));
    // this.viewData = content;
    if (this.rootData == null) {
      try {
        this.rootData = this.viewData;
        this.setRootData(this.rootData);
      } catch (e) {
        console.error(e);
      }
    }

    this.setViewData(this.viewData);
    return this.viewData;
  }

  /**
   * 提交的校验函数，默认返回true，允许重写
   */
  public async getValidatorRes() {
    return true;
  }

  /**
   * 提交数据的时候触发，默认只提交 `viewData` 数据
   */
  public async submit() {
    return this.viewData;
  }

  /**
   * 修改数据的时候触发
   */
  public async update() {
    const value = await this.submit();
    if (Object.keys(value).length !== 0) {
      this.model!.pk.forEach((pk) => (value[pk] = this.viewData[pk]));
      return updateOne(this.model!.model, value);
    }
  }

  /**
   * 创建，数据源来于`submit`函数返回的，默认是viewData
   */
  public async create(actionElement: ActionElement) {
    await this.submit();

    if (actionElement) {
      if (actionElement.submitApi) {
        return customMutationByApi(actionElement.api, this.model!.model, this.viewData);
      }
      console.warn('submitApi missing', actionElement);
    }
    return insertOne(this.model!.model, this.viewData);
  }

  /**
   * 获取form widget的数据，该方法不会触发submit
   */
  public getData() {
    return this.viewData;
  }

  /**
   * 重新修改viewData
   *
   * @param {IObjectValue} content 数据
   */
  public setData(content: IObjectValue) {
    this.setViewData(content);
  }

  /**
   * 修改viewData中的某一个属性
   */
  public setDataByKey(key: string, val: any) {
    const value = this.getData();

    const newValue = {
      ...value,
      [key]: val
    };

    this.setViewData(newValue);
  }
}
