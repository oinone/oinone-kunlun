import { DslDefinition, XMLTemplateParser } from '@kunlun/dsl';
import { DslProps, RuntimeContext, RuntimeContextManager } from '@kunlun/engine';
import { IDslNode } from '@kunlun/meta';
import { isNil } from 'lodash-es';
import { VueWidget, Widget } from '../basic';

/**
 * @deprecated 请使用PathWidget或ActiveRecordsWidget
 */
export class DslNodeWidget<IViewProps extends DslProps = DslProps> extends VueWidget<IViewProps> {
  @Widget.Reactive()
  protected metadataHandle: string | undefined;

  @Widget.Reactive()
  protected rootHandle: string | undefined;

  @Widget.Reactive()
  protected currentHandle!: string;

  @Widget.Reactive({ render: false })
  protected dslNode?: IDslNode;

  @Widget.Reactive({ render: false })
  protected template: DslDefinition | undefined;

  @Widget.Reactive()
  protected slotName: string | undefined;

  /**
   * 上级路径
   */
  @Widget.Reactive()
  @Widget.Inject('path')
  protected parentPath: string | undefined;

  /**
   * 当前子路径
   */
  @Widget.Reactive()
  protected subPath: string | undefined;

  /**
   * 当前子路径
   */
  @Widget.Reactive()
  protected subIndex: string | number | undefined;

  /**
   * 完整路径
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get widgetPath() {
    let path = this.parentPath || '';
    const { subPath, subIndex } = this;
    if (subPath) {
      if (path) {
        path = `${path}.${subPath}`;
      } else {
        path = subPath;
      }
    }
    if (subIndex != null) {
      path = `${path}[${subIndex}]`;
    }
    return path;
  }

  @Widget.Reactive()
  protected widgetInline: boolean | undefined;

  @Widget.Reactive()
  protected get variables(): Record<string, unknown> {
    const vari = XMLTemplateParser.resolveVariables(this.getDsl());
    return vari;
  }

  public initialize(config: IViewProps) {
    super.initialize(config);
    this.dslNode = config.dslNode;
    this.metadataHandle = config.metadataHandle;
    this.rootHandle = config.rootHandle;
    this.template = config.template;
    this.slotName = config.slotName;
    this.widgetInline = config.widgetInline;
    this.currentHandle = this.getHandle();
    const { subPath, subIndex } = config;
    this.subPath = subPath || this.template?.dslNodeType || '';
    if (isNil(subIndex)) {
      this.subIndex = config.__index;
    } else {
      this.subIndex = subIndex;
    }
    return this;
  }

  public getDsl(): IDslNode {
    return this.dslNode || ({} as IDslNode);
  }

  public getSlotName() {
    return this.slotName;
  }

  /**
   * 根据标签名获取dsl
   */
  public getDslChildrenByLabel(labelName: string) {
    if (this.dslNode) {
      return (this.dslNode.children || []).find((c) => c.tagName === labelName.toUpperCase());
    }
    return null;
  }

  public get metadataRuntimeContext(): RuntimeContext | undefined {
    const { metadataHandle } = this;
    if (metadataHandle) {
      return RuntimeContextManager.get(metadataHandle);
    }
    return undefined;
  }

  public get rootRuntimeContext(): RuntimeContext | undefined {
    const { rootHandle } = this;
    if (rootHandle) {
      return RuntimeContextManager.get(rootHandle);
    }
    return undefined;
  }
}
