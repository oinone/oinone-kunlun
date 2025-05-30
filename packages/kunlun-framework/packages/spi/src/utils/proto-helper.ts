const PROTO = '__proto__';

export class ProtoHelper {
  public static define(object: Object, propertyKey: string | symbol, value: unknown) {
    object[PROTO][propertyKey] = value;
  }

  public static get<R>(object: Object, propertyKey: string | symbol): R | undefined {
    return object[PROTO][propertyKey];
  }

  public static delete(object: Object, propertyKey: string | symbol) {
    delete object[PROTO][propertyKey];
  }
}
