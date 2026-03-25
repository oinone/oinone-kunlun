import {
  type ActionDslDefinition,
  type DslDefinition,
  DslDefinitionType,
  ElementDslDefinition,
  type FieldDslDefinition,
  type PackDslDefinition,
  type SlotDslDefinition,
  type TemplateDslDefinition,
  type ViewDslDefinition
} from './dsl';

export class DslDefinitionHelper {
  public static isTemplate(dsl: DslDefinition | undefined): dsl is TemplateDslDefinition {
    return dsl?.dslNodeType === DslDefinitionType.TEMPLATE;
  }

  public static isSlot(dsl: DslDefinition | undefined): dsl is SlotDslDefinition {
    return dsl?.dslNodeType === DslDefinitionType.SLOT;
  }

  public static isView(dsl: DslDefinition | undefined): dsl is ViewDslDefinition {
    return dsl?.dslNodeType === DslDefinitionType.VIEW;
  }

  public static isAction(dsl: DslDefinition | undefined): dsl is ActionDslDefinition {
    return dsl?.dslNodeType === DslDefinitionType.ACTION;
  }

  public static isField(dsl: DslDefinition | undefined): dsl is FieldDslDefinition {
    return dsl?.dslNodeType === DslDefinitionType.FIELD;
  }

  public static isPack(dsl: DslDefinition | undefined): dsl is PackDslDefinition {
    return dsl?.dslNodeType === DslDefinitionType.PACK;
  }

  public static isElement(dsl: DslDefinition | undefined): dsl is ElementDslDefinition {
    return dsl?.dslNodeType === DslDefinitionType.ELEMENT;
  }
}
