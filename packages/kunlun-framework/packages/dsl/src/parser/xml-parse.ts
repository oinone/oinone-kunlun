import { DslDefinition, DslDefinitionType } from '../typing';

/**
 * 根据节点获取所需值
 */
type NodeMapping<T> = (node: Element) => T;

/**
 * 根据节点和属性获取所需值
 */
type AttributeMapping<T> = (node: Element, attribute: Attr) => T;

/**
 * 内部映射类型
 */
type InternalMapping<T> = (node: Element, attribute?: Attr) => T;

/**
 * XmlParse节点映射
 */
export type XmlParseNodeMapping<T> = [[string] | NodeMapping<boolean>, T | NodeMapping<T>][];

/**
 * XmlParse属性映射
 * 支持多个字符串映射到指定值或调用映射函数{@link AttributeMapping}获取指定值
 * 支持调用判定函数{@link AttributeMapping<boolean>}进行映射判定
 */
export type XmlParseAttributeMapping<T> = [[string] | AttributeMapping<boolean>, T | AttributeMapping<T>][];

/**
 * {@link DslDefinition}语言支持
 */
export class DslDefinitionLanguage {
  public static DEFAULT = new DslDefinitionLanguage(
    [[['xslot'], 'slot']],
    [],
    [
      [
        (node: Element, attribute: Attr) => {
          return node.nodeName === DslDefinitionType.VIEW && attribute.name === 'type';
        },
        (node: Element, attribute: Attr) => {
          return attribute.value.toUpperCase();
        }
      ],
      [
        /**
         * 当值为"true"或"false"时进行转换
         * @param node
         * @param attribute
         */
        (node: Element, attribute: Attr) => {
          const { value } = attribute;
          return ['true', 'false'].includes(value);
        },
        (node: Element, attribute: Attr) => {
          const { value } = attribute;
          if (value === 'true') {
            return true;
          }
          if (value === 'false') {
            return false;
          }
          return value;
        }
      ]
    ]
  );

  /**
   * {@link DslDefinition#dslNodeType}映射
   */
  public readonly dslNodeTypeMapping: XmlParseNodeMapping<string>;

  /**
   * xml属性名称映射
   */
  public readonly attributeNameMapping: XmlParseAttributeMapping<string>;

  /**
   * xml属性值映射
   */
  public readonly attributeValueMapping: XmlParseAttributeMapping<unknown>;

  public constructor(
    dslNodeTypeMapping: XmlParseNodeMapping<string>,
    attributeNameMapping: XmlParseAttributeMapping<string>,
    attributeValueMapping: XmlParseAttributeMapping<unknown>
  ) {
    this.dslNodeTypeMapping = dslNodeTypeMapping;
    this.attributeNameMapping = attributeNameMapping;
    this.attributeValueMapping = attributeValueMapping;
  }
}

/**
 * xml解析
 */
export class XMLParse {
  public static INSTANCE = new XMLParse();

  private static DOM_PARSER = new DOMParser();

  private readonly language: DslDefinitionLanguage;

  public constructor(language?: DslDefinitionLanguage) {
    this.language = language || DslDefinitionLanguage.DEFAULT;
  }

  public parse<T extends DslDefinition = DslDefinition>(xml: string): T {
    const root: Document = XMLParse.DOM_PARSER.parseFromString(xml, 'text/xml');
    return this.parseElement(root.documentElement) as T;
  }

  private parseElement(node: Element): DslDefinition {
    const widgets: DslDefinition[] = [];
    let content: string | undefined;
    const childrenLength = node.children.length;
    if (childrenLength) {
      for (let i = 0; i < childrenLength; i++) {
        const child = node.children.item(i);
        if (child) {
          widgets.push(this.parseElement(child));
        }
      }
    } else if (node.textContent) {
      content = node.textContent;
    }
    const dslNodeType = this.dslNodeTypeConverter(node, node.nodeName);
    const dslDefinition = {
      dslNodeType,
      widgets
    } as DslDefinition;
    if (content) {
      dslDefinition.__content = content;
    }
    const attributeLength = node.attributes.length;
    for (let i = 0; i < attributeLength; i++) {
      const attribute = node.attributes.item(i);
      if (attribute) {
        dslDefinition[this.attributeNameConverter(node, attribute, attribute.name)] = this.attributeValueConverter(
          node,
          attribute,
          attribute.value
        );
      }
    }
    return dslDefinition;
  }

  private dslNodeTypeConverter(node: Element, dslNodeType: string): string {
    return XMLParse.mapping(node, undefined, dslNodeType, this.language.dslNodeTypeMapping);
  }

  private attributeNameConverter(node: Element, attribute: Attr, name: string): string {
    return XMLParse.mapping(node, attribute, name, this.language.attributeNameMapping);
  }

  private attributeValueConverter(node: Element, attribute: Attr, value: string): unknown {
    return XMLParse.mapping(node, attribute, value, this.language.attributeValueMapping);
  }

  private static mapping<T>(
    node: Element,
    attribute: Attr | undefined,
    key: string,
    mappings: XmlParseAttributeMapping<T>
  ): T {
    for (const [keyPredict, valueMapping] of mappings) {
      let predict: boolean;
      if (typeof keyPredict === 'function') {
        predict = (keyPredict as InternalMapping<boolean>)(node, attribute);
      } else {
        predict = keyPredict.includes(key);
      }
      if (predict) {
        if (typeof valueMapping === 'function') {
          return (valueMapping as InternalMapping<T>)(node, attribute);
        }
        return valueMapping;
      }
    }
    return key as unknown as T;
  }
}
