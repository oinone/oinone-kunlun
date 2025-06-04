import { isDev } from '@oinone/kunlun-router';
import { ILogger } from './interface';

const con = console;

class _Logger implements ILogger {
  constructor(validateDev = false) {
    this.validateDev = !!validateDev;
  }

  // 校验开发环境, 默认不开启
  private validateDev = false;

  public log(msg: string, ...data: any[]) {
    this.canLog() && con.log(msg, data);
  }

  public debug(msg: string, ...data: any[]) {
    this.canLog() && con.debug(msg, data);
  }

  public info(msg: string, ...data: any[]) {
    this.canLog() && con.info(msg, data);
  }

  public warn(msg: string, ...data: any[]) {
    this.canLog() && con.warn(msg, data);
  }

  public error(msg: string, ...data: any[]) {
    this.canLog() && con.error(msg, data);
  }

  public dir(msg: string, ...data: any[]) {
    this.canLog() && con.dir(msg, data);
  }

  public assert(value: any, message: string, ...optionalParams: any[]) {
    this.canLog() && con.assert(value, message, optionalParams);
  }

  public time(label?: string) {
    this.canLog() && con.time(label);
  }

  public timeEnd(label?: string) {
    this.canLog() && con.timeEnd(label);
  }

  public trace(message?: any, ...optionalParams: any[]) {
    this.canLog() && con.trace(message, optionalParams);
  }

  private canLog() {
    return this.validateDev ? isDev() : true;
  }
}

const logger = new _Logger();

/**
 * 开发环境打印日志
 */
const devLogger = new _Logger(true);

export { logger, devLogger };
