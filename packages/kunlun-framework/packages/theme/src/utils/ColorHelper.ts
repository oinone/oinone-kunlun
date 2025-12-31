export interface RGB {
  r: number;
  g: number;
  b: number;
}

export class ColorHelper {
  /**
   * 将十六进制颜色转换为RGB对象
   * @param {string} hex - 十六进制颜色字符串，如 '#035DFF'
   * @returns {Object} RGB对象，包含r, g, b属性，值为0-255
   */
  public static hexToRgb(hex: string): RGB {
    // 移除可能的#号
    hex = hex.replace(/^#/, '');

    // 解析RGB分量
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  }

  /**
   * 将RGB对象转换为十六进制颜色
   * @param {Object} rgb - RGB对象，包含r, g, b属性，值为0-255
   * @returns {string} 十六进制颜色字符串，如 '#E6EFFE'
   */
  public static rgbToHex(rgb: RGB): string {
    // 将每个分量转换为两位十六进制数，并拼接
    const r = ColorHelper.componentToHex(rgb.r);
    const g = ColorHelper.componentToHex(rgb.g);
    const b = ColorHelper.componentToHex(rgb.b);

    return `#${r}${g}${b}`;
  }

  /**
   * 将单个颜色分量转换为两位十六进制数
   * @param {number} c - 颜色分量，值为0-255
   * @returns {string} 两位十六进制字符串
   */
  private static componentToHex(c: number): string {
    const hex = c.toString(16);
    // 确保结果是两位，不足的前面补0
    return hex.length === 1 ? `0${hex}` : hex;
  }

  /**
   * 计算半透明颜色在背景色上的等效不透明颜色
   * @param {string} color - 半透明颜色的十六进制字符串，如 '#035DFF'
   * @param {number} alpha - 透明度，0-1之间的数值，如0.1
   * @param {string} backgroundColor - 背景色的十六进制字符串，默认为白色 '#FFFFFF'
   * @returns {string} 等效的不透明颜色的十六进制字符串
   */
  public static getAlphaColor(color: string, alpha: number, backgroundColor = '#FFFFFF') {
    // 验证输入
    if (alpha < 0 || alpha > 1) {
      throw new Error('透明度必须是0到1之间的数值');
    }

    // 转换为RGB
    const colorRgb = ColorHelper.hexToRgb(color);
    const bgRgb = ColorHelper.hexToRgb(backgroundColor);

    // 计算等效RGB值
    const r = Math.round(colorRgb.r * alpha + bgRgb.r * (1 - alpha));
    const g = Math.round(colorRgb.g * alpha + bgRgb.g * (1 - alpha));
    const b = Math.round(colorRgb.b * alpha + bgRgb.b * (1 - alpha));

    // 转换回十六进制
    return ColorHelper.rgbToHex({ r, g, b });
  }
}
