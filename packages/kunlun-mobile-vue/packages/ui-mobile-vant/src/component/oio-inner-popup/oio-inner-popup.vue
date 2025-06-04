<script lang="ts">
import {
  ButtonType,
  DrawerPlacement,
  OioIcon,
  OioInnerPopupProps,
  PropRecordHelper
} from '@oinone/kunlun-vue-ui-common';
import { isFunction, isString } from 'lodash-es';
import { computed, createVNode, defineComponent, Teleport, VNode, VNodeProps, vShow, watch, withDirectives } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioButton } from '../oio-button';
import { OioSpin } from '../oio-spin';
// import { OioTooltipHelp } from '../oio-tooltip';

const CLASS_NAME = `${DEFAULT_PREFIX}-inner-popup`;

const TELEPORT_TARGET_CLASS_NAME = `${CLASS_NAME}-target`;

const CLEAR_TELEPORT_TARGET_CLASS_NAMES = [
  TELEPORT_TARGET_CLASS_NAME,
  `${CLASS_NAME}-${DrawerPlacement.top}`,
  `${CLASS_NAME}-${DrawerPlacement.right}`,
  `${CLASS_NAME}-${DrawerPlacement.bottom}`,
  `${CLASS_NAME}-${DrawerPlacement.left}`
];

function createTitle(children: VNode[]) {
  return createVNode('div', { class: `${CLASS_NAME}-title-wrapper` }, children);
}

function createHeader(children: VNode[]) {
  return createVNode('div', { class: `${CLASS_NAME}-header` }, children);
}

function createBody(children: VNode[]) {
  return createVNode('div', { class: `${CLASS_NAME}-body` }, children);
}

function createFooter(children: VNode[]) {
  return createVNode('div', { class: `${CLASS_NAME}-footer` }, children);
}

export default defineComponent({
  name: 'oio-inner-popup',
  components: {
    OioButton,
    OioIcon,
    OioSpin
  },
  inheritAttrs: false,
  props: {
    ...OioInnerPopupProps
  },
  setup(props) {
    const teleportTarget = computed<HTMLElement>(() => {
      const teleport = props.teleport;
      if (!teleport) {
        throw new Error('Invalid teleport handle.');
      }
      let finalTeleport: string | HTMLElement | null | undefined;
      if (isFunction(teleport)) {
        finalTeleport = teleport();
      } else {
        finalTeleport = teleport;
      }
      if (isString(finalTeleport)) {
        finalTeleport = document.getElementById(finalTeleport);
      }
      return finalTeleport || document.body;
    });

    const appendClassNameToTeleportTarget = (target: HTMLElement, classNames: string[]) => {
      for (const className of classNames) {
        target.classList.add(className);
      }
    };

    const clearClassNameToTeleportTarget = (target: HTMLElement) => {
      CLEAR_TELEPORT_TARGET_CLASS_NAMES.forEach((className) => {
        target.classList.remove(className);
      });
    };

    watch(
      () => teleportTarget.value,
      (newVal, oldVal) => {
        if (oldVal) {
          clearClassNameToTeleportTarget(oldVal);
        }
        appendClassNameToTeleportTarget(newVal, [TELEPORT_TARGET_CLASS_NAME, `${CLASS_NAME}-${props.placement}`]);
      },
      { immediate: true }
    );

    return {
      teleportTarget
    };
  },
  render() {
    const {
      default: defaultSlot,
      title: titleSlot,
      header: headerSlot,
      footer: footerSlot
    } = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      },
      'title',
      'header',
      'footer'
    ]);

    const children: VNode[] = [];

    if (headerSlot) {
      children.push(createHeader(headerSlot()));
    } else {
      let finalTitleSlot = titleSlot;
      if (!finalTitleSlot) {
        finalTitleSlot = () => [
          createVNode('span', { class: `${CLASS_NAME}-title` }, this.title || OioInnerPopupProps.title.default)
        ];
      }
      if (this.help) {
        const titleChildren = finalTitleSlot();
        finalTitleSlot = () => {
          return [createVNode('span', {}, titleChildren), createVNode('div', {}, this.help)];
        };
      }
      const headerChildren = [createTitle(finalTitleSlot())];
      if (this.closable) {
        headerChildren.push(
          createVNode('div', { class: `${CLASS_NAME}-title-toolbar` }, [
            createVNode(
              'div',
              {
                class: `${CLASS_NAME}-title-icon-button`,
                onClick: this.cancelCallback
              },
              [createVNode(OioIcon, { icon: 'oinone-guanbi1' })]
            )
          ])
        );
      }
      children.push(createHeader(headerChildren));
    }

    children.push(createBody(defaultSlot()));

    if (footerSlot) {
      children.push(createFooter(footerSlot()));
    } else if (footerSlot !== null) {
      children.push(
        createFooter([
          createVNode(OioButton, {}, { default: () => this.cancelText }),
          createVNode(
            OioButton,
            {
              type: ButtonType.primary
            },
            { default: () => this.enterText }
          )
        ])
      );
    }

    return [
      createVNode(Teleport as VNodeProps, { to: this.teleportTarget }, [
        withDirectives(createVNode('div', PropRecordHelper.collectionBasicProps(this.$attrs, [CLASS_NAME]), children), [
          [vShow, this.visible]
        ])
      ])
    ];
  }
});
</script>
