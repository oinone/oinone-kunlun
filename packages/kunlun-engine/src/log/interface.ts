export interface IOptions {
  leave: keyof ILogger;
}

export interface ILogger {
  log(msg?: any, ...optionalParams: any[]): void;

  debug(msg: any, ...data: any[]): void;

  info(msg: any, ...data: any[]): void;

  warn(msg: any, ...data: any[]): void;

  error(msg: any, ...data: any[]): void;

  dir(msg: any, ...data: any[]): void;

  assert(value: any, message?: string, ...optionalParams: any[]): void;

  time(label?: string): void;

  timeEnd(label?: string): void;

  trace(message?: any, ...optionalParams: any[]): void;
}
