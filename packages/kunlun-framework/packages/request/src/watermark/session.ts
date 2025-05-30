import { WatermarkInfo } from './typing';
import watermark from './watermark';

let watermarkInfo: WatermarkInfo | undefined;

export function setWatermark(code: string, message: string) {
  if (!watermarkInfo) {
    watermarkInfo = { code, message };
    const t = setTimeout(() => {
      watermark.set(message, document.body);
      clearTimeout(t);
    }, 1000);
  }
}
