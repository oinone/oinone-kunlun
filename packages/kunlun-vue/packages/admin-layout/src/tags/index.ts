import { StringHelper } from '@kunlun/shared';
import { componentInstall, DEFAULT_TAG_PREFIX } from '@kunlun/vue-widget';
import { Component } from 'vue';
import { getMaskTagManagerInstance } from '../basic/register';
import Block from './Block.vue';
import Breadcrumb from './Breadcrumb.vue';
import Container from './Container.vue';
import Content from './Content.vue';
import Header from './Header.vue';
import Mask from './Mask.vue';
import MultiTabs from './MultiTabs.vue';
import './register';
import Sidebar from './Sidebar.vue';
import Widget from './Widget.vue';

export function maskInstall() {
  maskComponentInstall(Mask);

  maskComponentInstall(Widget);

  maskComponentInstall(Header);
  maskComponentInstall(Container);
  maskComponentInstall(Content);
  maskComponentInstall(Block);

  maskComponentInstall(Sidebar);
  maskComponentInstall(Breadcrumb);
  maskComponentInstall(MultiTabs);

  getMaskTagManagerInstance<Component>()
    ?.getComponents()
    .forEach((component) => {
      maskComponentInstall(component);
    });
}

function maskComponentInstall(component: Component) {
  const name = component.name;
  if (!name) {
    throw new Error('Invalid component name');
  }
  componentInstall(component, `${DEFAULT_TAG_PREFIX}-${StringHelper.camelCaseToKebabCase(name)}`);
}

export * from './context';
export * from './mixin';
export * from './register';
export * from './resolve';
