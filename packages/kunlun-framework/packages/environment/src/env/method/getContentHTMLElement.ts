import { RuntimeEnvironment } from '../typing';

export function getContentHTMLElement(this: RuntimeEnvironment): HTMLElement | undefined {
  const { contentSelector } = this;
  const el = document.querySelector<HTMLElement>(contentSelector);
  if (!el) {
    return undefined;
  }
  return el;
}
