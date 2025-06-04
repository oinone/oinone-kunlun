<template>
  <div class="van-cell van-field" v-bind="basicProps">
    <div :class="`${DEFAULT_PREFIX}-form-item-wrapper`">
      <div class="van-cell__title van-field__label" :class="required && 'van-field__label--required'">
        <slot name="label">{{ label }}</slot>
      </div>
      <div class="van-cell__value van-field__value">
        <div class="van-field__body">
          <div class="van-field__control van-field__control--custom">
            <slot />
          </div>
          <i class="van-badge__wrapper van-icon van-icon-clear van-field__clear" v-if="allowClear" @click="onClear" />
          <i class="van-badge__wrapper van-icon van-icon-arrow van-cell__right-icon" v-if="isLink" />
        </div>
      </div>
    </div>
    <div :class="`${DEFAULT_PREFIX}-form-item-extra`" v-if="$slots.extra">
      <slot name="extra" />
    </div>
    <div class="van-field__error-message" v-if="$slots.help"><slot name="help" /></div>
  </div>
</template>
<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import {
  AFormItemProps,
  FormLayout,
  OioFormItemProps,
  PropRecordHelper,
  useInjectOioFormContext
} from '@oinone/kunlun-vue-ui-common';
import { Field as VanField } from 'vant';
import { computed, createVNode, defineComponent, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioFormItem',
  inheritAttrs: false,
  props: {
    ...OioFormItemProps,
    hideLabel: Boolean,
    readonly: Boolean,
    isLink: Boolean,
    fakeVertical: Boolean,
    allowClear: Boolean,
    clearValue: Function,
    noBorderBottom: Boolean,
    noPaddingTop: Boolean,
    noShadow: {
      type: Boolean,
      default: false
    },
    autoHeight: Boolean,
    fieldValueOverflowHidden: Boolean
  },
  slots: ['default', 'label', 'extra', 'help'],
  setup(props, context) {
    const origin = ref();
    const formContext = useInjectOioFormContext();

    const vertical = computed(() => {
      let { layout } = props;
      if (!layout && formContext) {
        layout = formContext.layout.value!;
      }
      return layout === FormLayout.VERTICAL;
    });
    const fakeVertical = computed(() => props.fakeVertical && !vertical.value);

    // fixme @zbh 打包后 useInjectForm获取的对象与FormItem使用useInjectForm获取的对象不一致，目前使用自定义的OioFormContext进行处理
    // const subFormContext = { ...formContext };
    // subFormContext.vertical = vertical;
    // useProvideForm(subFormContext);

    context.expose({
      isVertical: () => vertical.value,
      onFieldBlur: () => origin.value.blur()
      // onFieldChange: () => origin.value.onFieldChange(),
      // clearValidate: () => origin.value.clear(),
      // resetField: () => origin.value.resetField()
    });

    const formItemClassName = `${DEFAULT_PREFIX}-form-item`;
    const formItemClassList = computed(() => {
      const list = [formItemClassName];
      if (vertical.value) {
        list.push(`${formItemClassName}-vertical`);
      } else {
        list.push(`${formItemClassName}-horizontal`);
      }
      fakeVertical.value && list.push(`${formItemClassName}-vertical-fake`);
      props.disabled && !props.noShadow && list.push(`${formItemClassName}-disabled`);
      props.readonly && !props.noShadow && list.push(`${formItemClassName}-readonly`);
      props.isLink && list.push(`${formItemClassName}-linked`);
      props.hideLabel && list.push(`${formItemClassName}-label-hidden`);
      props.autoHeight && list.push(`${formItemClassName}-auto-height`);
      props.allowClear && list.push(`${formItemClassName}-allow-clear`);
      props.noBorderBottom && list.push(`${formItemClassName}-no-border-bottom`);
      props.noPaddingTop && list.push(`${formItemClassName}-no-padding-top`);
      props.fieldValueOverflowHidden && list.push(`${formItemClassName}-field-value-overflow-hidden`);
      return StringHelper.append(list, CastHelper.cast(context.attrs.class));
    });

    const basicProps = computed(() => {
      return PropRecordHelper.collectionBasicProps(context.attrs, formItemClassList.value);
    });

    const fieldProps = computed(() => {
      return { ...props, ...context.attrs };
    });

    function onClear(e: Event) {
      e.stopPropagation();
      e.preventDefault();
      props?.clearValue?.();
    }

    return {
      onClear,
      fakeVertical,
      fieldProps,
      origin,
      vertical,
      formItemClassList,
      basicProps,
      DEFAULT_PREFIX
    };
  },
  render() {
    const formItemClassList = [`${DEFAULT_PREFIX}-form-item`];
    if (this.vertical) {
      formItemClassList.push(`${DEFAULT_PREFIX}-form-item-vertical`);
    } else {
      formItemClassList.push(`${DEFAULT_PREFIX}-form-item-horizontal`);
    }
    const children = PropRecordHelper.collectionSlots(this.$slots, [
      'input',
      // 兼容
      {
        origin: 'default',
        target: 'input',
        isNotNull: true
      },
      'error-message',
      // 兼容
      {
        origin: 'help',
        target: 'error-message'
      },
      'label',
      'left-icon',
      'right-icon',
      'button',
      'extra'
    ]);
    // children.input = () => {
    //   return [ renderSlot([(this.$slots.input! || this.$slots.default!)], 'default')] as VNode[];
    // };
    return createVNode(
      VanField,
      {
        ...PropRecordHelper.convert(AFormItemProps, CastHelper.cast(this)),
        ...this.$attrs,
        class: StringHelper.append(formItemClassList, CastHelper.cast(this.$attrs.class)),
        ref: 'origin'
      },
      children
    );
  }
});
</script>
