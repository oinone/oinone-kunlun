<script lang="ts">
import { StringHelper } from '@oinone/kunlun-shared';
import { getCopyrightStatus, systemMajorConfig } from '@oinone/kunlun-engine';
import { computed, createVNode, defineComponent, PropType } from 'vue';
import { Copyright } from '../../../typing';

export default defineComponent({
  name: 'ResetPasswordLayout',
  inheritAttrs: true,
  props: {
    logo: {
      type: String,
      required: true
    },
    copyright: {
      type: Object as PropType<Copyright>,
      required: true
    },
    wrapperClassName: {
      type: [String, Array] as PropType<string | string[]>
    }
  },
  setup(props) {
    const copyrightStatus = getCopyrightStatus();

    const contentClassNames = computed(() => {
      return StringHelper.append(['reset-password-container-content'], props.wrapperClassName);
    });

    const onCompanyUrl = () => {
      if (systemMajorConfig.officialWebsite) {
        window.open(systemMajorConfig.officialWebsite);
      }
    };

    return {
      contentClassNames,
      copyrightStatus,
      onCompanyUrl
    };
  },
  render() {
    return createVNode('div', { class: 'reset-password-container' }, [
      createVNode('div', { class: 'reset-password-container-header' }, [
        createVNode('img', { src: this.logo, alt: true })
      ]),
      createVNode('div', { class: this.contentClassNames }, this.$slots.default?.() || []),

      createVNode(
        'div',
        { class: 'reset-password-container-footer' },
        this.copyrightStatus
          ? [
              createVNode('span', {}, [
                `Copyrights ©${this.copyright.year} `,
                createVNode(
                  'span',
                  {
                    onClick: this.onCompanyUrl,
                    style: {
                      cursor: 'pointer'
                    }
                  },
                  this.$translate(this.copyright.company)
                )
              ]),
              createVNode('br'),
              createVNode('span', {}, `${this.copyright.icp}`)
            ]
          : []
      )
    ]);
  }
});
</script>
s
