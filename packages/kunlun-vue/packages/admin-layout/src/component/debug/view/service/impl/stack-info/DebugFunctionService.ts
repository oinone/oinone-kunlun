import { SPI } from '@kunlun/spi';
import { DebugStackInfoService, DebugStackInfoServiceToken } from '../../DebugStackInfoService';
import { DebugDefaultStackInfoService } from './DebugDefaultStackInfoService';

@SPI.Service(DebugStackInfoServiceToken, { name: 'function', priority: 0 })
export class DebugFunctionService extends DebugDefaultStackInfoService implements DebugStackInfoService {}
