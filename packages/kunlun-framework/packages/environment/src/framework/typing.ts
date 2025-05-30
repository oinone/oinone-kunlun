import { SPIOptions } from '@kunlun/spi';

export interface FrameworkInitializeOptions extends SPIOptions {
  framework: string;
  isMobile?: boolean;
}
