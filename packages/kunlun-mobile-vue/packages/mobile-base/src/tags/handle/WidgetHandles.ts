import { ComponentInternalInstance, Ref } from 'vue';

export class WidgetHandles {
  protected static map: Map<string, Ref<ComponentInternalInstance>> = new Map();

  public static get(handle: string) {
    return WidgetHandles.map.get(handle)?.value;
  }

  public static set(handle: string, instance: Ref<ComponentInternalInstance>) {
    if (WidgetHandles.get(handle)) {
      console.warn('widget handle is repeat.', handle);
      return;
    }
    WidgetHandles.map.set(handle, instance);
  }
}
