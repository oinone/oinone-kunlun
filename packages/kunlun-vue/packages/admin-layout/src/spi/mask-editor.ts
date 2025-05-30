import { DslDefinition } from '@kunlun/dsl';
import { ServiceIdentifier, SPI } from '@kunlun/spi';
import { InternalMaskWidget } from '../tags';

/**
 * 母版编辑上下文
 */
export interface MaskEditorContext {
  isDefault: boolean;
}

/**
 * 母版编辑API
 */
export interface MaskEditor {
  /**
   * 母版编辑
   * @param context
   * @param dsl
   */
  edit(context: Readonly<MaskEditorContext>, dsl: DslDefinition): DslDefinition;
}

/**
 * 母版编辑Token
 */
export const MaskEditorToken = ServiceIdentifier<MaskEditor>('MaskEditor');

/**
 * 母版编辑服务
 */
export interface MaskEditService {
  /**
   * 查找顶部栏组件集合
   * @param dsl 母版DSL
   */
  findTopBarWidgets(dsl: DslDefinition): DslDefinition[] | undefined;

  /**
   * 生成母版组件DSL
   * @param widget
   */
  generatorWidget(widget: string): DslDefinition;

  /**
   * 生成分割线DSL
   */
  generatorDivider(): DslDefinition;
}

/**
 * 母版编辑服务Token
 */
export const MaskEditServiceToken = ServiceIdentifier<MaskEditService>('MaskEditService');

@SPI.Service(MaskEditServiceToken)
export class DefaultMaskEditService implements MaskEditService {
  public findTopBarWidgets(dsl: DslDefinition): DslDefinition[] | undefined {
    return this.findDslNode(dsl, 'header', true)?.widgets?.find((v) => v.dslNodeType === 'block')?.widgets;
  }

  protected findDslNode(dsl: DslDefinition, dslNodeType: string, deep?: boolean): DslDefinition | undefined {
    if (dsl.dslNodeType === dslNodeType) {
      return dsl;
    }
    if (deep) {
      return this.findDslNodeByDeep(dsl, dslNodeType);
    }
    return dsl.widgets.find((v) => v.dslNodeType === dslNodeType);
  }

  protected findDslNodeByDeep(dsl: DslDefinition, dslNodeType: string): DslDefinition | undefined {
    for (const child of dsl.widgets) {
      if (child.dslNodeType === dslNodeType) {
        return child;
      }
      const target = this.findDslNodeByDeep(child, dslNodeType);
      if (target) {
        return target;
      }
    }
  }

  public generatorWidgetByDslNodeType(dslNodeType: string): DslDefinition {
    return {
      dslNodeType,
      widgets: []
    };
  }

  public generatorWidget(widget: string): DslDefinition {
    return {
      dslNodeType: InternalMaskWidget.Widget,
      widget,
      widgets: []
    };
  }

  public generatorDivider(): DslDefinition {
    return this.generatorWidget('divider');
  }
}
