import { SPI } from '@oinone/kunlun-spi';
import { type DebugStackInfoService, DebugStackInfoServiceToken } from '../../DebugStackInfoService';
import { DebugDefaultStackInfoService } from './DebugDefaultStackInfoService';

@SPI.Service(DebugStackInfoServiceToken, { name: 'function', priority: 0 })
export class DebugFunctionService extends DebugDefaultStackInfoService implements DebugStackInfoService {}
