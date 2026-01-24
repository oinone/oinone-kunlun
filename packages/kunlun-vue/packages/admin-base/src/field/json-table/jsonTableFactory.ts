import { isArray } from 'lodash-es';
import { DefineComponent } from 'vue';

type AnyComponent = DefineComponent<any, any, any, any, any>;

export class JsonTableFactory {
  private static componentsMap = new Map<string, AnyComponent>();

  public static registerTableCol(key: string | string[], component: AnyComponent) {
    if (!isArray(key)) {
      key = [key];
    }
    for (const keyItem of key) {
      JsonTableFactory.componentsMap.set(keyItem, component);
    }
  }

  public static selectTableCol(key: string) {
    return JsonTableFactory.componentsMap.get(key);
  }
}
