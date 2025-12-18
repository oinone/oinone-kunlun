import { toString } from 'lodash-es';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic/field/FormFieldWidget';
import JsonXmlView from './JsonXmlView.vue';

interface XmlConvertOptions {
  // 是否格式化输出（缩进）
  pretty?: boolean;
  // 缩进空格数（仅pretty为true时生效）
  indentSize?: number;
  // 是否忽略空值属性
  ignoreEmpty?: boolean;
}

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    widget: 'jsonXmlViewWidget'
  })
)
export class DetailJsonXmlViewWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(JsonXmlView);
    return this;
  }

  protected get defaultMode() {
    return this.getDsl().model || 'json';
  }

  @Widget.Reactive()
  protected mode = this.defaultMode;

  @Widget.Method()
  protected setMode(mode: string) {
    this.mode = mode;
  }

  @Widget.Reactive()
  protected get formatedValue() {
    if (!this.value) {
      return '-';
    }

    let jsonData = {};
    try {
      const jsonValue = JSON.parse(this.value as string);
      jsonData = jsonValue;
    } catch (e) {
      return toString(this.value);
    }

    if (this.mode === 'json') {
      return jsonData;
    }

    if (this.mode === 'xml') {
      const proto = Object.getPrototypeOf(jsonData);
      if (proto === Object.prototype) {
        return this.objectToXml(jsonData, 'root', { pretty: true, indentSize: 2 });
      }
    }

    return toString(this.value);
  }

  protected objectToXml(obj: Record<string, any>, rootName = 'root', options: XmlConvertOptions = {}): string {
    const { pretty = true, indentSize = 2, ignoreEmpty = true } = options;

    // 生成缩进字符串
    const getIndent = (level: number): string => (pretty ? ' '.repeat(level * indentSize) : '');

    // 转义XML特殊字符
    const escapeXml = (str: string): string => {
      if (typeof str !== 'string') {
        return str;
      }
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    // 递归处理对象节点
    const buildXml = (data: any, nodeName: string, level: number): string => {
      const indent = getIndent(level);
      const childIndent = getIndent(level + 1);
      const newline = pretty ? '\n' : '';

      // 忽略空值（null/undefined/空字符串，根据配置）
      if (ignoreEmpty && (data === null || data === undefined || data === '')) {
        return '';
      }

      // 处理数组（多个同名节点）
      if (Array.isArray(data)) {
        return data.map((item) => buildXml(item, nodeName, level)).join(newline);
      }

      // 处理基本类型（字符串/数字/布尔）
      if (typeof data !== 'object' || data === null) {
        const value = escapeXml(String(data));
        return `${indent}<${nodeName}>${value}</${nodeName}>${newline}`;
      }

      // 处理嵌套对象
      const children = Object.entries(data)
        .map(([key, value]) => buildXml(value, key, level + 1))
        .filter((child) => child) // 过滤空节点
        .join(newline);

      // 构建节点
      if (children) {
        return `${indent}<${nodeName}>${newline}${children}${indent}</${nodeName}>${newline}`;
      }
      // 空对象节点
      return `${indent}<${nodeName}/>${newline}`;
    };

    // 生成XML头部和根节点
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>${pretty ? '\n' : ''}`;
    const rootXml = buildXml(obj, rootName, 0);

    return xmlHeader + rootXml;
  }
}
