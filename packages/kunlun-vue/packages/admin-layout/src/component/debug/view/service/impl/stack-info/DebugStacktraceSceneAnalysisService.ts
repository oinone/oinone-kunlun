import { SPI } from '@kunlun/spi';
import { DebugErrorAnalysisResult, DebugResponseError } from '../../../../typing';
import { DebugStackInfoService, DebugStackInfoServiceToken } from '../../DebugStackInfoService';
import { DebugDefaultStackInfoService } from './DebugDefaultStackInfoService';

@SPI.Service(DebugStackInfoServiceToken, { name: 'stacktraceSceneAnalysis', priority: 0 })
export class DebugStacktraceSceneAnalysisService extends DebugDefaultStackInfoService implements DebugStackInfoService {
  public analysis(error: DebugResponseError, errors: DebugResponseError[]): DebugErrorAnalysisResult | undefined {
    const stackInfo = this.getStackInfo(error);
    if (!stackInfo) {
      return undefined;
    }
    const scene = this.getTitle(error);
    let stackInfoString: string | undefined;
    if (scene) {
      const jsonData = this.parseStackInfo(error, errors);
      if (jsonData) {
        stackInfoString = this.beautifyJSON(jsonData[scene]);
      }
    }
    return {
      title: scene || '场景追踪堆栈',
      message: error.message,
      stackInfo: stackInfoString || this.beautifyJSON(stackInfo)
    };
  }

  protected getTitle(error: DebugResponseError): string | undefined {
    const match = error.message?.match(/\[(.*)]/);
    if (!match) {
      return undefined;
    }
    return match[1];
  }
}
