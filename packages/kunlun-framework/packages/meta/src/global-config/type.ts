import { ApiProtocol, QueryType } from '../metadata';

export interface IGlobalConfig {
  homepage?: {
    model: string;
    viewActionName: string;
  };

  login?: string;

  loginLogo?: string;

  loginPartnerName?: string;

  loginIcpDesc?: string;

  errorPage?: string;

  theme?: string;

  mask?: string;

  apiProtocol?: ApiProtocol;

  queryType?: QueryType.DOMAIN | QueryType.OBJECT;
}

export class GlobalConfig {
  public static defaultLoginPath = '/login';

  private static _config: IGlobalConfig = {};

  public static resister(config: IGlobalConfig) {
    this._config = config;
  }

  public static getConfig() {
    return this._config;
  }

  public static getConfigByName(name: keyof IGlobalConfig) {
    if (name === 'login') {
      return this._config.login || this.defaultLoginPath;
    }

    return this._config[name];
  }
}
