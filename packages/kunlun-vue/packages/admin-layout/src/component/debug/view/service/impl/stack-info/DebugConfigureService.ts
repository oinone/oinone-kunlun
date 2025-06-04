import { SPI } from '@oinone/kunlun-spi';
import { DebugStackInfoService, DebugStackInfoServiceToken } from '../../DebugStackInfoService';
import { DebugDefaultStackInfoService } from './DebugDefaultStackInfoService';

@SPI.Service(DebugStackInfoServiceToken, { name: 'configure', priority: 0 })
export class DebugConfigureService extends DebugDefaultStackInfoService implements DebugStackInfoService {}
