import { RuntimeConfigOptions } from '@kunlun/meta';
import { BooleanHelper, NumberHelper, Optional } from '@kunlun/shared';

export interface EnabledConfig extends RuntimeConfigOptions {
  enabled?: boolean;
}

export type EnabledConfigType = boolean | string | EnabledConfig | undefined;

export class ConfigHelper {
  public static getConfig<T extends EnabledConfig>(value: EnabledConfigType): T {
    if (value == null) {
      return {} as T;
    }
    const isEnabled = BooleanHelper.toBoolean(value);
    if (isEnabled == null) {
      return (value as T) || {};
    }
    return {
      enabled: isEnabled
    } as T;
  }

  public static getBoolean(value: boolean | string | undefined, defaultValue = false): boolean {
    return Optional.ofNullable(value).map(BooleanHelper.toBoolean).orElse(defaultValue)!;
  }

  public static getNumberNullable(value: string | number | undefined): number | undefined {
    return Optional.ofNullable(value).map(NumberHelper.toNumber).orElse(undefined)!;
  }

  public static getNumber(value: string | number | undefined, defaultValue: number): number {
    return Optional.ofNullable(value).map(NumberHelper.toNumber).orElse(defaultValue)!;
  }
}
