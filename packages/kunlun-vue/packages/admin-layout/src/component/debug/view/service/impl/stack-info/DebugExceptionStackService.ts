import { SPI } from '@kunlun/spi';
import { DebugErrorAnalysisResult, DebugResponseError } from '../../../../typing';
import { DebugStackInfoService, DebugStackInfoServiceToken } from '../../DebugStackInfoService';
import { DebugDefaultStackInfoService } from './DebugDefaultStackInfoService';

@SPI.Service(DebugStackInfoServiceToken, { name: 'exception', priority: 0 })
export class DebugExceptionStackService extends DebugDefaultStackInfoService implements DebugStackInfoService {
  public analysis(error: DebugResponseError): DebugErrorAnalysisResult | undefined {
    const stackInfo = this.getStackInfo(error);
    if (!stackInfo) {
      return undefined;
    }
    return {
      title: '全部堆栈',
      message: error.message,
      stackInfo: this.beautifyJSON(stackInfo)
    };
  }
}
