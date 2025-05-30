import { DslDefinition } from '@kunlun/dsl';
import { IModelField, ViewMode, ViewType } from '@kunlun/meta';
import { ContextNode } from '@kunlun/shared';
import {
  RouterPath,
  RuntimeModel,
  RuntimeModelField,
  RuntimeModule,
  RuntimeView,
  RuntimeViewAction
} from '../runtime-metadata';
import { QueryVariables, VirtualModel } from '../service/typing';
import { RelationUpdateType, SubmitType } from '../submit';

export type GetModelResult = {
  model: RuntimeModel;
  runtimeContext: RuntimeContext;
  isOther: boolean;
};

export type GetModelFieldResult = {
  modelField: RuntimeModelField;
  runtimeContext: RuntimeContext;
  isOther: boolean;
};

export interface RequestModelField {
  field: RuntimeModelField;
  referencesFields?: RequestModelField[];
}

export type RequestModelFieldFilterFunction = (
  field: RuntimeModelField,
  viewType: ViewType,
  viewMode: ViewMode,
  submitType: SubmitType,
  relationUpdateType: RelationUpdateType
) => boolean;

export interface GetRequestModelFieldsOptions {
  viewType?: ViewType;
  viewMode?: ViewMode;
  submitType?: SubmitType;
  relationUpdateType?: RelationUpdateType;
  filter?: boolean | RequestModelFieldFilterFunction;
}

export interface RuntimeContext<Framework = unknown> extends ContextNode<RuntimeContext<Framework>> {
  /**
   * 框架实例
   */
  frameworkInstance: Framework;
  /**
   * 路由路径
   */
  routers: RouterPath[];
  /**
   * 运行时跳转动作(通过跳转动作创建的运行时上下文具备该属性)
   */
  viewAction?: RuntimeViewAction;
  /**
   * 运行时字段(通过字段创建的运行时上下文具备该属性)
   */
  field?: RuntimeModelField;
  /**
   * 运行时模块
   */
  module: RuntimeModule;
  /**
   * 运行时模型
   */
  model: RuntimeModel;
  /**
   * 运行时虚拟模型
   */
  virtualModels?: Record<string, VirtualModel>;
  /**
   * 运行时视图
   */
  view: RuntimeView;
  /**
   * 视图布局dsl，从运行时视图解析获得
   */
  viewLayout: DslDefinition | undefined;
  /**
   * 视图模板dsl，从运行时视图解析获得
   */
  viewDsl: DslDefinition | undefined;
  /**
   * 视图最终执行dsl，从运行时视图解析获得或根据布局dsl和模板dsl合并生成
   */
  viewTemplate: DslDefinition;
  /**
   * 扩展数据
   */
  extendData: Record<string, unknown>;

  /**
   * 获取模型
   * @param model 模型编码
   * @param isBelong 是否仅查找当前上下文及子上下文的模型
   * @return 返回获取的模型和所在的运行时上下文
   */
  getModel(model: string, isBelong?: boolean): GetModelResult | undefined;

  /**
   * 获取模型字段
   * @param data 字段名称
   * @param isBelong 是否仅查找当前上下文及子上下文的模型字段
   * @return 返回获取的模型字段和所在的运行时上下文
   */
  getModelField(data: string, isBelong?: boolean): GetModelFieldResult | undefined;

  /**
   * 创建字段上下文
   * @param field 运行时模型字段
   */
  createFieldRuntimeContext(field: RuntimeModelField): RuntimeContext;

  /**
   * 深度解析模板，创建必要的子运行时上下文
   */
  deepResolve(): void;

  /**
   * 传输上下文参数到指定运行时上下文
   * @param runtimeContext 运行时上下文
   * @param clone 是否克隆; 默认: true
   */
  transfer(runtimeContext: RuntimeContext, clone?: boolean);

  /**
   * 获取请求字段
   * @deprecated 请使用{@link RuntimeContext#getRequestModelFields}方法替换
   */
  getRequestFields(): IModelField[];

  /**
   * 获取请求字段
   */
  getRequestModelFields(options?: GetRequestModelFieldsOptions): RequestModelField[];

  /**
   * 生成请求Variables参数
   * @param variables 其他Variables参数
   */
  generatorVariables(variables?: QueryVariables): QueryVariables;

  /**
   * 默认值缓存
   */
  defaultValueCache?: Record<string, unknown>;

  /**
   * 获取默认值
   */
  getDefaultValue(): Promise<Record<string, unknown>>;

  /**
   * 初始值缓存
   */
  initialValueCache?: Record<string, unknown>;

  /**
   * 获取初始值
   */
  getInitialValue(): Promise<Record<string, unknown>>;
}
