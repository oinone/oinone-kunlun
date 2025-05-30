<script lang="ts">
import { computed, createVNode, defineComponent, PropType } from 'vue';

interface HighlightValue {
  content: string;
  highlight?: boolean;
}

export default defineComponent({
  name: 'OioHighlight',
  props: {
    search: {
      type: String
    },
    content: {
      type: [String, Array] as PropType<string | string[]>
    },
    defaultContent: {
      type: String
    },
    ignoredCase: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const searchValue = computed(() => {
      if (props.ignoredCase) {
        return props.search?.toLowerCase();
      }
      return props.search;
    });

    const contentValues = computed<string[]>(() => {
      const contents = props.content;
      if (!contents) {
        return [];
      }
      if (Array.isArray(contents)) {
        if (props.ignoredCase) {
          return contents.map((c) => c.toLowerCase());
        }
        return contents;
      }
      if (props.ignoredCase) {
        return [contents.toLowerCase()];
      }
      return [contents];
    });

    const highlightValues = computed<{
      content: string;
      values: HighlightValue[];
    }>(() => {
      const search = searchValue.value;
      const contents = contentValues.value;
      if (!search || !contents.length) {
        const content = props.defaultContent || contents[0] || '';
        return {
          content,
          values: [{ content }]
        };
      }
      const results: HighlightValue[] = [];
      let finalContent: string | undefined;
      for (const content of contents) {
        let lastIndex = 0;
        let index = content.indexOf(search);
        const values: HighlightValue[] = [];
        while (index !== -1) {
          if (index > lastIndex) {
            values.push({ content: content.substring(lastIndex, index) });
          }
          lastIndex = index + search.length;
          values.push({
            content: content.substring(index, lastIndex),
            highlight: true
          });
          index = content.indexOf(search!, lastIndex);
        }
        if (values.length !== 0) {
          if (content.length > lastIndex) {
            values.push({
              content: content.substring(lastIndex)
            });
          }
          results.push(...values);
          finalContent = content;
          break;
        }
      }
      if (results.length === 0) {
        const content = props.defaultContent || contents[0] || '';
        return {
          content,
          values: [{ content }]
        };
      }
      return {
        content: finalContent || '',
        values: results
      };
    });

    return {
      highlightValues
    };
  },
  render() {
    const { content, values } = this.highlightValues;
    return createVNode(
      'span',
      {
        class: 'oio-highlight-wrapper',
        title: content
      },
      values.map((value) => {
        const { content, highlight } = value;
        if (highlight) {
          return createVNode('span', { class: 'oio-highlight' }, content);
        }
        return content;
      })
    );
  }
});
</script>
