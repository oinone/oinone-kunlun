import { RuntimeContextManager } from '@oinone/kunlun-engine';
import { isDev } from '@oinone/kunlun-router';
import { App, Component, Directive, Plugin } from 'vue';

export function componentInstall(component: Component, name?: string | string[]): void {
  if (!name) {
    name = component.name;
  }
  const app = RuntimeContextManager.createOrReplace<App>().frameworkInstance;
  if (name) {
    if (typeof name === 'string') {
      app.component(name, component);
    } else {
      name.forEach((s) => app.component(s, component));
    }
  } else if (isDev()) {
    console.warn('component install error. reason: name is blank.', component);
  }
}

export function directiveInstall(directive: Directive, name: string) {
  const app = RuntimeContextManager.createOrReplace<App>().frameworkInstance;
  app.directive(name, directive);
}

export function pluginInstall(plugin: Plugin, ...options: unknown[]) {
  const app = RuntimeContextManager.createOrReplace<App>().frameworkInstance;
  app.use(plugin, ...options);
}
