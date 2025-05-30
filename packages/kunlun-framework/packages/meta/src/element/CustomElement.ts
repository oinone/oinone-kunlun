import { IBaseElement } from './IBaseElement';

export abstract class CustomElement {
  private static nameMap: Map<string, IBaseElement> = new Map();

  private static attributeMap: Map<string, string[]> = new Map();

  public static Name(elementName: string) {
    return <T extends IBaseElement>(target: T, name: string) => {
      CustomElement.nameMap.set(elementName, target);
    };
  }

  public static AttributeName(attributeName: string) {
    return <T extends IBaseElement>(target: T, name: string) => {
      const attrs: string[] = CustomElement.attributeMap.get('elementName') as string[];
      if (!attrs.includes(attributeName)) {
        attrs.push(attributeName);
      }
    };
  }
}
