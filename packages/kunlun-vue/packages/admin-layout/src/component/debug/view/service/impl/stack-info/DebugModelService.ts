import { SPI } from '@oinone/kunlun-spi';
import { DebugStackInfoService, DebugStackInfoServiceToken } from '../../DebugStackInfoService';
import { DebugDefaultStackInfoService } from './DebugDefaultStackInfoService';

@SPI.Service(DebugStackInfoServiceToken, { name: 'model', priority: 0 })
export class DebugModelService extends DebugDefaultStackInfoService implements DebugStackInfoService {}
