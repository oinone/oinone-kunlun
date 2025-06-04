import { DslDefinition } from '@oinone/kunlun-dsl';
import { ServiceIdentifier, SPI } from '@oinone/kunlun-spi';
import { UnsupportedOperationException } from '../../exception';
import { RuntimeViewAction } from '../../runtime-metadata';
import { RuntimeContext } from '../runtime-context';

/**
 * 运行时上下文服务
 */
export interface RuntimeContextService {
  /**
   * 通过跳转动作创建运行时上下文
   * @param viewAction 跳转动作
   * @param inline 是否内联视图
   * @param nodeHandle 手动指定当前运行时上下文唯一键
   * @param rootHandle 手动指定当前运行时上下文的根上下文
   */
  createRuntimeContextByViewAction(
    viewAction: RuntimeViewAction,
    inline: boolean,
    nodeHandle?: string,
    rootHandle?: string
  ): RuntimeContext | undefined;

  /**
   * 通过跳转动作获取当前视图母版
   * @param viewAction 跳转动作
   * @param moduleName 模块名称
   */
  seekViewMask(viewAction: RuntimeViewAction, moduleName?: string): DslDefinition | undefined;
}

/**
 * 运行时上下文服务Token
 */
export const RuntimeContextServiceToken = ServiceIdentifier<RuntimeContextService>('RuntimeContextService');

@SPI.Service(RuntimeContextServiceToken)
export class DefaultRuntimeContextService implements RuntimeContextService {
  public createRuntimeContextByViewAction(
    viewAction: RuntimeViewAction,
    inline: boolean,
    nodeHandle?: string,
    rootHandle?: string
  ): RuntimeContext | undefined {
    throw new UnsupportedOperationException();
  }

  public seekViewMask(viewAction: RuntimeViewAction): DslDefinition {
    throw new UnsupportedOperationException();
  }
}
