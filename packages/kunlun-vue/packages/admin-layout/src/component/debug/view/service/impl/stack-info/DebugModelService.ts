import { SPI } from '@oinone/kunlun-spi';
import { type DebugStackInfoService, DebugStackInfoServiceToken } from '../../DebugStackInfoService';
import { DebugDefaultStackInfoService } from './DebugDefaultStackInfoService';

@SPI.Service(DebugStackInfoServiceToken, { name: 'model', priority: 0 })
export class DebugModelService extends DebugDefaultStackInfoService implements DebugStackInfoService {}
