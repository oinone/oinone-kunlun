import { StringHelper } from '@kunlun/shared';
import { Component, defineComponent } from 'vue';
import { IMaskTagManager, setMaskTagManagerInstance } from '../../basic/register';
import { MaskWidgetTagMixin } from '../mixin';
import { InternalMaskWidget, registerMaskWidgetFunction } from '../resolve';

export class InternalMaskTagManager implements IMaskTagManager<Component> {
  protected tags = new Map<string, Component>();

  public getComponents(): Component[] {
    return Array.from(this.tags.values());
  }

  public isInternalWidget(dslNodeType: string): boolean {
    return Object.values(InternalMaskWidget).findIndex((v) => v === dslNodeType) !== -1;
  }

  public register(dslNodeType: string): boolean {
    const camelCase = StringHelper.kebabCaseToCamelCase(dslNodeType);
    const componentName = `${camelCase[0].toUpperCase()}${camelCase.substring(1)}`;

    if (!registerMaskWidgetFunction(componentName)) {
      return false;
    }

    const component = defineComponent({
      name: componentName,
      mixins: [MaskWidgetTagMixin],
      inheritAttrs: false,
      methods: {
        getWidgetTag(): InternalMaskWidget | string {
          return componentName;
        }
      }
    });
    this.tags.set(componentName, component);
    return true;
  }
}

export const MaskTagManager = new InternalMaskTagManager();

setMaskTagManagerInstance(MaskTagManager);
