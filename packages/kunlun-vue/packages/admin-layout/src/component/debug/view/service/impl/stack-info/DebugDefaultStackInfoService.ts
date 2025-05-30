import { SPI } from '@kunlun/spi';
import { isArray } from 'lodash-es';
import { DebugErrorAnalysisResult, DebugResponseError } from '../../../../typing';
import { DebugUtils } from '../../../debug-utils';
import {
  DebugDefaultStackInfoServiceType,
  DebugStackInfoService,
  DebugStackInfoServiceToken,
  DebugUnhandledExceptionTitle
} from '../../DebugStackInfoService';

@SPI.Service(DebugStackInfoServiceToken, { name: DebugDefaultStackInfoServiceType, priority: 0 })
export class DebugDefaultStackInfoService implements DebugStackInfoService {
  public analysis(error: DebugResponseError, errors: DebugResponseError[]): DebugErrorAnalysisResult | undefined {
    const stackInfo = this.getStackInfo(error);
    if (!stackInfo) {
      return undefined;
    }
    return {
      title: error.message || DebugUnhandledExceptionTitle,
      message: error.message,
      stackInfo: this.beautifyJSON(stackInfo)
    };
  }

  public parseStackInfo(error: DebugResponseError, errors: DebugResponseError[]): Record<string, unknown> | undefined {
    const stackInfo = this.getStackInfo(error);
    if (!stackInfo) {
      return undefined;
    }
    try {
      return JSON.parse(stackInfo);
    } catch (e) {
      console.error('Invalid json data.', e);
    }
  }

  protected getStackInfo(error: DebugResponseError): string | undefined {
    const stackInfo = error.extensions?.stackTraceMsg;
    if (!stackInfo || stackInfo === 'null') {
      return undefined;
    }
    return stackInfo;
  }

  protected beautifyJSON(stackInfo: unknown): string {
    if (typeof stackInfo === 'string') {
      try {
        const jsonData = JSON.parse(stackInfo);
        if (isArray(jsonData)) {
          if (jsonData.every((v) => typeof v === 'string')) {
            return jsonData.join('\n');
          }
        }
        return DebugUtils.toJSONString(jsonData);
      } catch (e) {
        return stackInfo;
      }
    }
    return DebugUtils.toJSONString(stackInfo);
  }
}
