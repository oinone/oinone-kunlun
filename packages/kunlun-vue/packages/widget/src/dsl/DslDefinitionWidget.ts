import {
  ComputeContext,
  ComputeContextManager,
  ROOT_HANDLE,
  RuntimeContext,
  RuntimeContextManager,
  RuntimeModelField
} from '@kunlun/engine';
import { BooleanHelper } from '@kunlun/shared';
import { isNil } from 'lodash-es';
import { Widget } from '../basic';
import { InvisibleSupported, isAllInvisible } from '../feature';
import { DslRenderWidget, DslRenderWidgetProps } from './DslRenderWidget';

/**
 * dsl组件属性
 */
export interface DslDefinitionWidgetProps extends DslRenderWidgetProps {
  /**
   * 元数据视图handle
   */
  metadataHandle?: string;
  /**
   * 根组件handle（一般为视图组件）
   */
  rootHandle?: string;
  /**
   * 是否内联组件
   */
  inline?: boolean;
  /**
   * 自动组件
   */
  automatic?: boolean;
}

/**
 * dsl定义组件
 */
export class DslDefinitionWidget<Props extends DslDefinitionWidgetProps = DslDefinitionWidgetProps>
  extends DslRenderWidget<Props>
  implements InvisibleSupported
{
  @Widget.Reactive()
  protected automatic = false;

  @Widget.Reactive()
  protected metadataHandle: string | undefined;

  public getMetadataHandle() {
    return this.metadataHandle;
  }

  @Widget.Reactive()
  protected rootHandle: string | undefined;

  public getRootHandle() {
    return this.rootHandle;
  }

  @Widget.Reactive()
  protected readonly currentHandle: string;

  public getCurrentHandle() {
    return this.currentHandle;
  }

  @Widget.Reactive()
  protected inline: boolean | undefined;

  protected defaultAllInvisible = false;

  @Widget.Reactive()
  public get allInvisible(): boolean | undefined {
    const { allInvisible } = this.getDsl();
    if (isNil(allInvisible)) {
      return this.defaultAllInvisible;
    }
    return BooleanHelper.toBoolean(allInvisible);
  }

  @Widget.Reactive()
  private invisibleState = false;

  private lastedInvisibleState: boolean | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  public parentInvisible: boolean | undefined;

  @Widget.Reactive()
  public get invisible(): boolean {
    let { invisible } = this.getDsl();
    if (isNil(invisible)) {
      invisible = false;
    } else {
      invisible = this.invisibleProcess(invisible);
    }
    if (invisible) {
      return invisible;
    }
    if (!this.allInvisible) {
      return false;
    }
    this.invisibleState = this.childrenInvisibleProcess();
    return this.invisibleState;
  }

  @Widget.Reactive()
  @Widget.Provide('parentInvisible')
  public get parentInvisibleProvider() {
    return this.parentInvisible || this.invisible;
  }

  public constructor(handle?: string) {
    super(handle);
    this.currentHandle = this.getHandle();
  }

  public initialize(props: Props) {
    super.initialize(props);
    this.metadataHandle = props.metadataHandle;
    this.rootHandle = props.rootHandle;
    this.automatic = props.automatic || false;
    this.inline = props.inline;
    return this;
  }

  public get metadataRuntimeContext(): RuntimeContext {
    const { metadataHandle } = this;
    let runtimeContext: RuntimeContext | undefined;
    if (metadataHandle) {
      runtimeContext = RuntimeContextManager.get(metadataHandle);
    }
    if (!runtimeContext) {
      throw new Error('Invalid metadata runtime context.');
    }
    return runtimeContext;
  }

  public get rootRuntimeContext(): RuntimeContext {
    const { rootHandle } = this;
    let runtimeContext: RuntimeContext | undefined;
    if (rootHandle) {
      runtimeContext = RuntimeContextManager.get(rootHandle);
    }
    if (!runtimeContext) {
      throw new Error('Invalid root runtime context.');
    }
    return runtimeContext;
  }

  public get rootComputeContext(): ComputeContext | undefined {
    const { rootHandle } = this;
    let computeContext: ComputeContext | undefined;
    if (rootHandle) {
      computeContext = ComputeContextManager.get(rootHandle);
    }
    return computeContext;
  }

  public get rootViewRuntimeContext(): { runtimeContext: RuntimeContext; fields: RuntimeModelField[] } {
    const fields: RuntimeModelField[] = [];
    let targetRuntimeContext: RuntimeContext = this.rootRuntimeContext;
    let field = targetRuntimeContext?.parentContext?.field;
    while (field && targetRuntimeContext) {
      fields.push(field);

      const fieldRuntimeContextHandle = targetRuntimeContext?.parentContext?.handle;
      if (!fieldRuntimeContextHandle) {
        throw new Error('Invalid field runtime context handle');
      }

      const nextTargetRuntimeContext = (Widget.select(fieldRuntimeContextHandle) as DslDefinitionWidget)
        ?.rootRuntimeContext;

      const parentRuntimeContext = nextTargetRuntimeContext?.parentContext;
      if (!parentRuntimeContext || parentRuntimeContext.handle === ROOT_HANDLE) {
        break;
      }

      field = parentRuntimeContext.field;
      targetRuntimeContext = nextTargetRuntimeContext;
    }
    return {
      runtimeContext: targetRuntimeContext,
      fields
    };
  }

  protected invisibleProcess(invisible: boolean | string) {
    return BooleanHelper.toBoolean(invisible);
  }

  protected childrenInvisibleProcess(): boolean {
    return isAllInvisible(this.getChildren());
  }

  protected resetInvisible(): void {
    if (this.allInvisible) {
      this.invisibleState = this.childrenInvisibleProcess();
    }
  }

  protected resetParentInvisible(): void {
    (this.getParent() as DslDefinitionWidget | undefined)?.resetInvisible?.();
  }

  protected $$mounted() {
    super.$$mounted();
    this.resetInvisible();
    this.lastedInvisibleState = this.invisible;
  }

  protected $$updated() {
    super.$$updated();
    const { lastedInvisibleState, invisible } = this;
    this.lastedInvisibleState = invisible;
    if (lastedInvisibleState !== invisible) {
      this.resetParentInvisible();
    }
  }

  protected $$unmountedAfterProperties() {
    super.$$unmountedAfterProperties();
    if (!this.automatic && this.metadataHandle === this.rootHandle) {
      RuntimeContextManager.delete(this.metadataHandle);
    }
  }

  @Widget.Method()
  protected allMounted() {
    this.resetInvisible();
  }
}
