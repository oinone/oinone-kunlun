<template>
  <div class="json-xml-view">
    <div class="code-viewer-tool-content">
      <span class="mode-label">
        <span>{{ mode }}</span>
      </span>
      <div class="tools">
        <div class="copy-btn" @click="copyBtnClick" :title="$translate('复制')">
          <oio-icon icon="oinone-fuzhi2" size="18" v-if="!copied" />
          <div v-else>{{ $translate('已复制') }}</div>
        </div>
        <oio-select
          v-model:value="selectedValue"
          :options="selectedList"
          @update:value="
            (data) => {
              setMode(data.label);
            }
          "
        />
      </div>
    </div>
    <div class="code-viewer">
      <!-- 行号区域 -->
      <div class="line-numbers">
        <div v-for="lineNum in visibleLines" :key="lineNum" class="line-number">
          {{ lineNum }}
        </div>
      </div>

      <!-- 代码内容区域 -->
      <div class="code-content">
        <div v-for="(line, index) in parsedLines" :key="index" class="code-line">
          <!-- 缩进 -->
          <span :style="{ marginLeft: `${line.indent * 20}px` }" class="line-wrapper">
            <!-- 折叠按钮 -->
            <span v-if="line.collapsible && mode === 'json'" @click="toggleCollapse(index)" class="collapse-btn">
              <oio-icon v-if="!collapsedLines.has(index)" class="icon" icon="oinone-xiala7" size="16" />
              <oio-icon v-else class="icon" icon="oinone-xiala6" size="16" />
            </span>
            <span v-else-if="mode === 'json'" class="icon-spacer"></span>

            <!-- 代码内容 -->
            <span v-html="line.html"></span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, watch, defineComponent, PropType } from 'vue';
import { isString } from 'lodash-es';
import { OioIcon, OioSelect } from '@oinone/kunlun-vue-ui-antd';

interface JsonLine {
  indent: number;
  html: string;
  collapsible: boolean;
  type?: string;
}

export default defineComponent({
  name: 'jsonXmlViewer',
  components: {
    OioIcon,
    OioSelect
  },
  props: {
    mode: {
      type: String,
      default: 'json'
    },
    formatedValue: {
      type: [Object, String] as PropType<Object | String>
    },
    setMode: {
      type: Function
    },
    copyBtnClick: {
      type: Function
    },
    copied: {
      type: Boolean
    }
  },
  setup(props) {
    const collapsedLines = ref(new Set());

    /**
     * 正则表达式：匹配URL（支持http/https/ftp/sftp，以及常见文件后缀）
     * 匹配规则：
     * 1. 以http/https/ftp/sftp开头
     * 2. 包含域名/IP + 可选路径/文件
     * 3. 支持常见文件后缀（.png/.jpg/.pdf/.doc等）
     * 4. 排除URL前后的标点符号
     */
    const URL_REGEX = /\b(https?:\/\/|ftp:\/\/|sftp:\/\/)([^\s<>"]+)(\.[a-zA-Z0-9]{2,10})([^\s<>"]*)?\b/g;

    /**
     * 将JSON对象解析为带语法高亮和链接的HTML行数据
     * @param obj 要解析的JSON对象
     * @param indent 缩进级别
     * @returns 解析后的行数据数组
     */
    const parseJSON = (obj: unknown, indent = 0): JsonLine[] => {
      const lines: Array<JsonLine> = [];

      /**
       * 处理字符串中的URL，将其替换为a标签
       * @param str 原始字符串
       * @returns 处理后的HTML字符串
       */
      const replaceUrlWithLink = (str: string): string => {
        // 先通过JSON.stringify转义，再替换URL
        const escapedStr = JSON.stringify(str).slice(1, -1); // 去掉首尾的引号
        return escapedStr.replace(URL_REGEX, (match) => {
          // 对匹配到的URL进行转义，防止XSS
          const encodedUrl = encodeURI(match);
          return `<a href="${encodedUrl}" target="_blank" class="text-blue-500 underline hover:text-blue-700">${match}</a>`;
        });
      };

      if (Array.isArray(obj)) {
        lines.push({
          indent,
          html: '<span class="text-purple-600">[</span>',
          collapsible: obj.length > 0,
          type: 'array-start'
        });

        obj.forEach((item, index) => {
          const isLast = index === obj.length - 1;
          if (typeof item === 'object' && item !== null) {
            const childLines = parseJSON(item, indent + 1);
            childLines[childLines.length - 1].html += isLast ? '' : '<span class="text-gray-600">,</span>';
            lines.push(...childLines);
          } else {
            let itemHtml = '';
            if (typeof item === 'string') {
              // 字符串类型：处理其中的URL
              itemHtml = `<span class="text-green-600">"${replaceUrlWithLink(item)}"</span>`;
            } else {
              // 非字符串类型：直接JSON.stringify
              itemHtml = `<span class="text-green-600">${JSON.stringify(item)}</span>`;
            }
            // 添加逗号
            itemHtml += isLast ? '' : '<span class="text-gray-600">,</span>';

            lines.push({
              indent: indent + 1,
              html: itemHtml,
              collapsible: false
            });
          }
        });

        lines.push({
          indent,
          html: '<span class="text-purple-600">]</span>',
          collapsible: false,
          type: 'array-end'
        });
      } else if (typeof obj === 'object' && obj !== null) {
        lines.push({
          indent,
          html: '<span class="text-purple-600">{</span>',
          collapsible: Object.keys(obj).length > 0,
          type: 'object-start'
        });

        const entries = Object.entries(obj);
        if (entries.length === 0) {
          lines.push({
            indent: indent + 1,
            html: '<span class="text-blue-600">-</span>',
            collapsible: false,
            type: 'object-empty'
          });
        }
        entries.forEach(([key, value], index) => {
          const isLast = index === entries.length - 1;

          if (typeof value === 'object' && value !== null) {
            // 处理嵌套对象/数组
            lines.push({
              indent: indent + 1,
              html: `<span class="text-blue-600">"${key}"</span><span class="text-gray-600">: </span>`,
              collapsible: false
            });
            const childLines = parseJSON(value, indent + 1);
            childLines[0].html = `<span class="text-blue-600">"${key}"</span><span class="text-gray-600">: </span>${childLines[0].html}`;
            childLines[childLines.length - 1].html += isLast ? '' : '<span class="text-gray-600">,</span>';
            lines.pop();
            lines.push(...childLines);
          } else {
            // 处理基础类型值
            let valueHtml = '';
            const valueColor = typeof value === 'string' ? 'text-green-600' : 'text-orange-600';

            if (typeof value === 'string') {
              // 字符串类型：处理URL
              valueHtml = `"${replaceUrlWithLink(value)}"`;
            } else {
              // 非字符串类型：直接序列化
              valueHtml = JSON.stringify(value);
            }

            // 拼接最终HTML
            lines.push({
              indent: indent + 1,
              html: `<span class="text-blue-600">"${key}"</span><span class="text-gray-600">: </span><span class="${valueColor}">${valueHtml}</span>${
                isLast ? '' : '<span class="text-gray-600">,</span>'
              }`,
              collapsible: false
            });
          }
        });

        lines.push({
          indent,
          html: '<span class="text-purple-600">}</span>',
          collapsible: false,
          type: 'object-end'
        });
      }

      return lines;
    };

    // 解析XML
    const parseXML = (xmlString): JsonLine[] => {
      if (!xmlString || !isString(xmlString)) {
        return [];
      }
      xmlString = xmlString
        .replace(/\n/g, '')
        .replace(/<[^/]*?>/g, (match) => `\n${match}\n`)
        .replace(/<\/.*?>/g, (match) => `\n${match}\n`);
      const lines: JsonLine[] = [];
      const xmlLines = xmlString.trim().split('\n');
      let indent = 0;

      xmlLines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return;
        }

        // 检测结束标签
        if (trimmed.startsWith('</')) {
          indent--;
        }

        const isOpenTag = trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>');

        const regx = /<[^/]*?>/g;
        const closeAble = regx.test(line);

        const lineHtml = line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

        lines.push({
          indent,
          html: `<pre>${lineHtml}</pre>`,
          collapsible: closeAble
        });
        if (isOpenTag) {
          indent++;
        }
      });

      return lines;
    };

    const parseString = (str): JsonLine[] => {
      const lines: JsonLine[] = [];
      lines.push({
        indent: 1,
        html: `<span class="text-gray-600">${str}</span>`,
        collapsible: false
      });
      return lines;
    };

    // 计算所有行
    const allLines = computed((): JsonLine[] => {
      if (props.mode === 'json' && isString(props.formatedValue)) {
        return parseString(props.formatedValue);
      }
      if (props.mode === 'json') {
        return parseJSON(props.formatedValue);
      }
      return parseXML(props.formatedValue);
    });

    // 计算可见行（考虑折叠）
    const parsedLines = computed(() => {
      const result: JsonLine[] = [];
      const collapsedRanges = new Set();

      // 首先标记所有被折叠的行范围
      allLines.value.forEach((line, index) => {
        if (collapsedLines.value.has(index) && line.collapsible) {
          let depth = 1;
          for (let i = index + 1; i < allLines.value.length; i++) {
            if (allLines.value[i].type?.includes('start')) {
              depth++;
            }
            if (allLines.value[i].type?.includes('end')) {
              depth--;
            }

            if (depth === 0) {
              // 标记从 index+1 到 i-1 的所有行为被折叠（不包括结束行）
              for (let j = index + 1; j < i; j++) {
                collapsedRanges.add(j);
              }
              break;
            }
          }
        }
      });

      // 只添加未被折叠的行
      allLines.value.forEach((line, index) => {
        if (!collapsedRanges.has(index)) {
          result.push(line);
        }
      });

      return result;
    });

    // 可见行号
    const visibleLines = computed(() => {
      return parsedLines.value.map((_, index) => index + 1);
    });

    // 切换折叠
    const toggleCollapse = (visibleIndex) => {
      const line = parsedLines.value[visibleIndex];
      const actualIndex = allLines.value.indexOf(line);

      if (actualIndex === -1) {
        return;
      }

      if (collapsedLines.value.has(actualIndex)) {
        collapsedLines.value.delete(actualIndex);
      } else {
        collapsedLines.value.add(actualIndex);
      }

      // 触发响应式更新
      collapsedLines.value = new Set(collapsedLines.value);
    };

    // 切换格式时重置折叠状态
    watch(
      () => props.mode,
      () => {
        collapsedLines.value.clear();
      }
    );

    const selectedValue = ref(props.mode);
    const selectedList = ref(['json', 'xml']);

    return {
      allLines,
      visibleLines,
      collapsedLines,
      parsedLines,
      selectedValue,
      selectedList,
      toggleCollapse
    };
  }
});
</script>

<style lang="scss">
.json-xml-view {
  border: 1px solid var(--oio-border-color);
  border-radius: var(--oio-border-radius);
  background-color: var(--oio-background);
  box-shadow: var(--oio-box-shadow);

  .code-viewer-tool-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--oio-border-color);
    padding: var(--oio-padding-xxs) var(--oio-padding-sm);

    .mode-label {
      padding: var(--oio-padding-xxs) var(--oio-padding-xs);
      background: rgba(var(--oio-select-item-readonly-bg), 0.1);
      color: var(--oio-select-item-readonly-color);
      border-radius: var(--oio-border-radius);
    }

    .tools {
      display: flex;
      align-items: center;

      .copy-btn {
        cursor: pointer;
        width: 100%;

        div {
          font-size: var(--oio-font-size-sm);
        }

        &:hover {
          .oio-icon {
            color: var(--oio-primary-color-hover);
          }
        }
      }

      .oio-select {
        .ant-select-selector {
          border: none !important;
          box-shadow: none !important;
          gap: var(--oio-padding-xs);
        }
      }
    }
  }

  .code-viewer {
    display: flex;
    overflow: hidden;

    /* 行号区域 */
    .line-numbers {
      background-color: var(--oio-body-background);
      border-right: 1px solid var(--oio-border-color);
      padding: var(--oio-padding) var(--oio-padding-md);
      user-select: none;

      .line-number {
        text-align: right;
        font-size: var(--oio-font-size-sm);
        color: var(--oio-text-color-secondary);
        font-family: 'Courier New', monospace;
        line-height: 24px;
        height: 24px;
      }
    }

    /* 代码内容区域 */
    .code-content {
      flex: 1;
      padding: var(--oio-padding);
      overflow: auto;
      font-family: 'Courier New', monospace;
      font-size: var(--oio-font-size);

      .code-line {
        line-height: 24px;
        height: 24px;
        display: flex;
        align-items: center;

        .line-wrapper {
          display: inline-flex;
          align-items: center;

          /* 折叠按钮 */
          .collapse-btn {
            margin-right: var(--oio-margin-xs);
            padding: var(--oio-padding-xss);
            border-radius: var(--oio-border-radius);
            background: transparent;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .collapse-btn:hover {
            background-color: var(--oio-body-background);
          }
        }

        pre {
          margin: 0;
        }

        span {
          text-wrap: nowrap;
        }
      }

      .text-gray-600 {
        color: #4b5563;
      }

      .text-blue-600 {
        color: #2563eb;
      }

      .text-green-600 {
        color: #16a34a;
      }

      .text-orange-600 {
        color: #ea580c;
      }

      .text-purple-600 {
        color: #9333ea;
      }
    }
  }
}
</style>
