import { SPIOptions } from '@oinone/kunlun-spi';

export interface FrameworkInitializeOptions extends SPIOptions {
  framework: string;
  isMobile?: boolean;
}
