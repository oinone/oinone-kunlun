// 将hex表示方式转换为rgb表示方式(这里返回rgb数组模式)
export function colorRgb(sColor) {
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6,})$/;
  sColor = sColor.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    // 处理六位的颜色值
    const sColorChange = [] as any[];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`));
    }
    const [red, green, blue] = sColorChange;
    return { r: red, g: green, b: blue, a: 1};
  } else {
    return sColor;
  }
}

/**
 * HSB / HSV颜色准确转换为RGB
 * hsv/hsva
 */
export function hsvToRgb(hsvStr: string) {
  let alpha = 1;
  const hsv = {h: 0, s: 0, b: 0};
  if (hsvStr.startsWith('hsva')) {
    let arr = splitColor(hsvStr, 'hsva');
    hsv.h = arr[0] as any;
    hsv.s = arr[1] as any;
    hsv.b = arr[2] as any;
    alpha = arr[3] as any;
  } else if (hsvStr.startsWith('hsv')) {
    let arr = splitColor(hsvStr, 'hsv');
    hsv.h = arr[0] as any;
    hsv.s = arr[1] as any;
    hsv.b = arr[2] as any;
  } else {
    return { r: 0, g: 0, b: 0, a: 1};
  }

  const rgb = {} as any;
  let h = Math.round(hsv.h);
  const s = Math.round(hsv.s * 255 / 100);
  const v = Math.round(hsv.b * 255 / 100);

  if (s == 0) {
    rgb.r = rgb.g = rgb.b = v;
  } else {
    const t1 = v;
    const t2 = (255 - s) * v / 255;
    const t3 = (t1 - t2) * (h % 60) / 60;
    if (h == 360) h = 0;
    if (h < 60) {
      rgb.r = t1;
      rgb.b = t2;
      rgb.g = t2 + t3
    } else if (h < 120) {
      rgb.g = t1;
      rgb.b = t2;
      rgb.r = t1 - t3
    } else if (h < 180) {
      rgb.g = t1;
      rgb.r = t2;
      rgb.b = t2 + t3
    } else if (h < 240) {
      rgb.b = t1;
      rgb.r = t2;
      rgb.g = t1 - t3
    } else if (h < 300) {
      rgb.b = t1;
      rgb.g = t2;
      rgb.r = t2 + t3
    } else if (h < 360) {
      rgb.r = t1;
      rgb.g = t2;
      rgb.b = t1 - t3
    } else {
      rgb.r = 0;
      rgb.g = 0;
      rgb.b = 0
    }
  }
  return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b), a: alpha};

}


/**
 * HSL颜色值转换为RGB.
 * 换算公式改编自 http://en.wikipedia.org/wiki/HSL_color_space.
 * h, s, 和 l 设定在 [0, 1] 之间
 * 返回的 r, g, 和 b 在 [0, 255]之间
 *
 * @param   Number  h       色相
 * @param   Number  s       饱和度
 * @param   Number  l       亮度
 * @return  Array           RGB色值数值
 */
export function hslToRgb(hslStr: string) {
  let alpha = 1;
  let h, s, l;
  if (hslStr.startsWith('hsla')) {
    let arr = splitColor(hslStr, 'hsla');
    h = arr[0];
    s = arr[1];
    l = arr[2];
    alpha = arr[3] as any;
  } else if (hslStr.startsWith('hsl')) {
    let arr = splitColor(hslStr, 'hsl');
    h = arr[0];
    s = arr[1];
    l = arr[2];
  } else {
    return { r: 0, g: 0, b: 0, a: 1};
  }
  if (s.includes('%')) {
    s = s.replace('%', '') / 100;
  }
  if (l.includes('%')) {
    l = l.replace('%', '') / 100;
  }

  let r, g, b;

  if(s == 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: alpha};
}

export function autoRgba(color: string) {
  if (!color) {
    return { r: 0, g: 0, b: 0, a: 1};
  }
  if (color.startsWith('#')) {
    return colorRgb(color);
  }
  if (color.startsWith('hsl')) {
    return hslToRgb(color);
  }
  if (color.startsWith('hsv')) {
    return hsvToRgb(color);
  }
  if (color.startsWith('rgba')) {
    const [r, g, b, a] = splitColor(color, 'rgba');
    return { r, g, b, a};
  } else if (color.startsWith('rgb')) {
    const [r, g, b] = splitColor(color, 'rgb');
    return { r, g, b, a: 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1};
}

function splitColor(color: string, prefix: string) {
  return color.replace(prefix + '(', '').replace(')', '').split(',').map((a) => a.trim());
}

export function autoRgbaStr(color: string) {
  const { r, g, b, a } = autoRgba(color);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
