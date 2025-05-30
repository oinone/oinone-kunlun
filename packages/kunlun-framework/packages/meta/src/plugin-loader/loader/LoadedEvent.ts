type ResolveFunction = () => void;

export function bindScriptLoadedEvent(script: HTMLScriptElement, resolve: ResolveFunction): void {
  script.onload = onLoaded(script.src, resolve);
  script.onerror = onErrorLoaded(script.src, resolve);
}

export function bindLinkLoadedEvent(link: HTMLLinkElement, resolve: ResolveFunction): void {
  link.onload = onLoaded(link.href, resolve);
  link.onerror = onErrorLoaded(link.href, resolve);
}

function onLoaded(src: string, resolve: ResolveFunction) {
  return () => {
    resolve();
  };
}

function onErrorLoaded(src: string, resolve: ResolveFunction) {
  return () => {
    resolve();
    console.error(`load error. ${src}`);
  };
}
