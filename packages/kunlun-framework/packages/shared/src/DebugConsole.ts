import { isDevMode } from './env';
import { prettyConsole } from './PrettyConsole';

class DebugConsole {
  private isDev: boolean | undefined = undefined;

  private autoSetIsDev() {
    if (this.isDev === undefined) {
      this.isDev = isDevMode();
    }
  }

  run(fun: Function) {
    this.autoSetIsDev();
    if (this.isDev) {
      try {
        fun?.();
      } catch (e) {
        console.error('debug was error', e);
      }
    }
  }

  private callConsole(method: string, ...args) {
    this.run(() => {
      console[method]?.(...args);
    });
  }

  log(...data: any[]) {
    this.callConsole('log', ...data);
  }

  debug(...data: any[]) {
    this.callConsole('debug', ...data);
  }

  info(...data: any[]) {
    this.callConsole('info', ...data);
  }

  warn(...data: any[]) {
    this.callConsole('warn', ...data);
  }

  error(...data: any[]) {
    this.callConsole('error', ...data);
  }

  trace(...data: any[]) {
    this.callConsole('trace', ...data);
  }

  clear() {
    this.callConsole('clear');
  }

  group(...data: any[]) {
    this.callConsole('group', ...data);
  }

  groupEnd() {
    this.callConsole('groupEnd');
  }

  table(tabularData?: any, properties?: string[]) {
    this.callConsole('table', tabularData, properties);
  }

  private callPrettyConsole(method: string, ...args) {
    this.run(() => {
      prettyConsole[method]?.(...args);
    });
  }

  prettyInfo(textOrTitle, content = '') {
    this.callPrettyConsole('info', textOrTitle, content);
  }

  prettyWarning(textOrTitle, content = '') {
    this.callPrettyConsole('warning', textOrTitle, content);
  }

  prettyError(textOrTitle, content = '') {
    this.callPrettyConsole('error', textOrTitle, content);
  }

  prettySuccess(textOrTitle, content = '') {
    this.callPrettyConsole('success', textOrTitle, content);
  }
}

export const debugConsole = new DebugConsole();
