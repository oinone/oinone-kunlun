import { createVNode } from 'vue';
import TranslateBoxWidget from './TranslateBoxWidget.vue';

export class TranslateBox {
  public static getWidget() {
    return createVNode(TranslateBoxWidget);
  }
}
