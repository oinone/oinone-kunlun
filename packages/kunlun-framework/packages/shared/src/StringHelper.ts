import { isString, sampleSize } from 'lodash-es';
import { Consumer } from './LambdaFunction';

export class StringHelper {
  public static ARRAY_DEFAULT_SEPARATOR = ',';

  /**
   * A
   */
  public static readonly UPPER_A_ASCLL = 65;

  /**
   * Z
   */
  public static readonly UPPER_Z_ASCLL = 90;

  /**
   * a
   */
  public static readonly LOWER_A_ASCLL = 97;

  /**
   * z
   */
  public static readonly LOWER_Z_ASCLL = 122;

  /**
   * -
   */
  public static readonly KEBAB_ASCLL = 45;

  /**
   * 是否为英文字母
   */
  public static isLetter(code: number): boolean {
    return (
      (StringHelper.UPPER_A_ASCLL <= code && code <= StringHelper.UPPER_Z_ASCLL) ||
      (StringHelper.LOWER_A_ASCLL <= code && code <= StringHelper.LOWER_Z_ASCLL)
    );
  }

  /**
   * 数组拼接，自动过滤非字符串及空字符串
   * @param array 基础数组
   * @param others 需要拼接的其他数组
   */
  public static append(array: string[], ...others: (string | string[] | undefined)[]): string[] {
    others.forEach((other) => {
      if (isString(other)) {
        if (other) {
          array.push(other);
        }
      } else if (Array.isArray(other)) {
        other.forEach((v) => {
          if (isString(v)) {
            if (v) {
              array.push(v);
            }
          }
        });
      }
    });
    return array;
  }

  /**
   * 小驼峰转短横线分割
   * @param s
   */
  public static camelCaseToKebabCase(s: string) {
    let result = '';
    for (const c of s) {
      const charCode = c.charCodeAt(0);
      if (charCode >= StringHelper.UPPER_A_ASCLL && charCode <= StringHelper.UPPER_Z_ASCLL) {
        if (result) {
          result = result.concat('-', c.toLowerCase());
        } else {
          result = result.concat(c.toLowerCase());
        }
      } else {
        result = result.concat(c);
      }
    }
    return result;
  }

  /**
   * 短横线分割转小驼峰
   * @param s
   */
  public static kebabCaseToCamelCase(s: string) {
    let result = '';
    let toUpperCase = false;
    for (const c of s) {
      const charCode = c.charCodeAt(0);
      if (charCode === StringHelper.KEBAB_ASCLL) {
        toUpperCase = true;
      } else if (toUpperCase) {
        result = result.concat(c.toUpperCase());
        toUpperCase = false;
      } else {
        result = result.concat(c);
      }
    }
    return result;
  }

  /**
   * 转换为标准字符串数组，自动使用trim方法
   * @param val 值
   * @param separator 分隔符，默认使用 {@link StringHelper#ARRAY_DEFAULT_SEPARATOR}
   */
  public static convertArray(
    val: string | string[] | null | undefined,
    separator?: string | RegExp
  ): string[] | undefined {
    if (Array.isArray(val)) {
      return val.filter((v) => !!v).map((v) => v.trim());
    }
    if (isString(val)) {
      if (!separator) {
        separator = StringHelper.ARRAY_DEFAULT_SEPARATOR;
      }
      return val
        .split(separator)
        .filter((v) => !!v)
        .map((v) => v.trim());
    }
    return undefined;
  }

  public static getOrDefault(s: string | null | undefined, defaultValue: string): string {
    if (!s) {
      return defaultValue;
    }
    return s;
  }

  public static setter(s: string | null | undefined, fn: Consumer<string>): void {
    if (s) {
      fn(s);
    }
  }

  // 生成一个由指定长度的随机字符串组成的数组
  public static random(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return sampleSize(characters, length).join('');
  }
}

/**
 * 简单字符流
 */
export class SimpleCharStream {
  /**
   * 原始字符串
   * @private
   */
  private inputString: string;

  /**
   * 字符串读取缓冲区
   * @private
   */
  private buffer = '';

  /**
   * 缓冲区大小
   * @private
   */
  private readonly bufsize;

  /**
   * 缓冲区可用大小
   * @private
   */
  private readonly available;

  /**
   * 当前缓冲区在原始字符串中的起始位置索引
   * @private
   */
  private pos = -1;

  /**
   * 当前缓冲区索引
   * @private
   */
  private bufpos = -1;

  private inBuf = 0;

  /**
   * 缓冲区可读取的最大索引
   * @private
   */
  private maxNextCharInd = 0;

  /**
   * 当前读取字符索引在缓冲区的索引
   * @private
   */
  private tokenBegin = -1;

  public constructor(inputString: string, bufferSize = 4096) {
    this.inputString = inputString;
    this.bufsize = bufferSize;
    this.available = bufferSize;
  }

  public beginToken(): string | undefined {
    this.tokenBegin = -1;
    const c = this.readChar();
    this.tokenBegin = this.pos;
    return c;
  }

  public backup(amount: number) {
    this.inBuf += amount;
    this.bufpos -= amount;
    if (this.bufpos < 0) {
      this.bufpos += this.bufsize;
    }
  }

  public getImage() {
    if (this.bufpos >= this.tokenBegin) {
      return this.buffer.substring(this.tokenBegin, this.bufpos - this.tokenBegin + 1);
    }
    return `${this.buffer.substring(this.tokenBegin, this.bufsize - this.tokenBegin)}${this.buffer.substring(
      0,
      this.bufpos + 1
    )}`;
  }

  public readChar(): string | undefined {
    if (++this.bufpos >= this.maxNextCharInd) {
      this.fillBuffer();
    }
    const c = this.buffer.charAt(this.bufpos);
    // 更新行列相关属性
    return c;
  }

  private fillBuffer() {
    if (this.maxNextCharInd === this.available) {
      // 缓冲区充盈状态处理
    }
    const buffer = this.inputString.substring(this.maxNextCharInd, this.available - this.maxNextCharInd);
    this.buffer = buffer;
    this.maxNextCharInd += buffer.length - 1;
  }
}
