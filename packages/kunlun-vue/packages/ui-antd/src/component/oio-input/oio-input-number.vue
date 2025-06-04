<script lang="ts">
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import {
  BigNumber,
  CastHelper,
  fetchRealValue,
  NumberHelper,
  Optional,
  StandardNumber,
  StringHelper
} from '@oinone/kunlun-shared';
import { OioInputNumberProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { isEmpty, isNil, isString, toString } from 'lodash-es';
import { computed, createVNode, defineComponent, ref, Slot } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import OioInput from './oio-input.vue';

export default defineComponent({
  name: 'OioInputNumber',
  components: {
    OioInput
  },
  inheritAttrs: false,
  props: {
    ...OioInputNumberProps
  },
  slots: ['prepend', 'append', 'prefix', 'suffix'],
  emits: ['update:value', 'focus', 'blur'],
  setup(props, context) {
    const origin = ref();
    const realValue = computed<BigNumber | undefined>(() => {
      return Optional.ofNullable(props.value)
        .map<BigNumber | undefined>((v) => new BigNumber(v!))
        .orElse(undefined);
    });
    const focused = ref<boolean>(false);

    const realMinValue = computed(() => {
      const { min, minSafeInteger } = props;
      return fetchRealValue(min, minSafeInteger);
    });

    const realMaxValue = computed(() => {
      const { max, maxSafeInteger } = props;
      return fetchRealValue(max, maxSafeInteger);
    });

    const compareToMinValue = (val: BigNumber): boolean => {
      const min = realMinValue.value;
      if (isNil(min)) {
        return true;
      }
      return val.comparedTo(min.value) >= 0;
    };

    const compareToMaxValue = (val: BigNumber): boolean => {
      const max = realMaxValue.value;
      if (isNil(max)) {
        return true;
      }
      return val.comparedTo(max.value) <= 0;
    };

    const change = (val: BigNumber | StandardNumber): boolean => {
      const rv = realValue.value;
      if (isNil(val)) {
        if (isNil(rv)) {
          return false;
        }
        context.emit('update:value', val);
        return true;
      }
      let newVal = val.toString();
      if (newVal.endsWith('.') || newVal.endsWith('0')) {
        context.emit('update:value', newVal);
        return true;
      }
      const newNumberVal = new BigNumber(newVal);
      if (!newNumberVal.isNaN()) {
        newVal = newNumberVal.toString();
      }
      const { value } = props;
      if (value && toString(value) === newVal) {
        return false;
      }
      context.emit('update:value', newVal);
      return true;
    };

    const setValue = (val: BigNumber | StandardNumber): boolean => {
      if (isNil(val)) {
        return change(val);
      }
      if (isString(val)) {
        if (isEmpty(val)) {
          return change(null);
        }
        if (val === '-' || val.indexOf('.') === val.length - 1) {
          if (props.precision === 0) {
            const ra = val.replaceAll('.', '');
            if (ra === '') {
              return change(undefined);
            }
            return change(ra);
          }
          return change(val);
        }
        const vsl = val.split('.').length;
        if (!isNil(props.precision)) {
          if (vsl > 2) {
            return false;
          }
        } else if (vsl !== 1) {
          return false;
        }
        if (!NumberHelper.isNumber(val)) {
          return false;
        }
      }
      return change(val);
    };

    const realAddStep = computed<BigNumber>(() => {
      return Optional.ofNullable(props.addStep)
        .map((v) => new BigNumber(v!))
        .filter((v) => !v.isNaN())
        .orElseGet(() =>
          Optional.ofNullable(props.step)
            .map((v) => new BigNumber(v!))
            .filter((v) => !v.isNaN())
            .orElse(new BigNumber(1))
        );
    });

    const realReduceStep = computed<BigNumber>(() => {
      return Optional.ofNullable(props.reduceStep)
        .map((v) => new BigNumber(v!))
        .filter((v) => !v.isNaN())
        .orElseGet(() =>
          Optional.ofNullable(props.step)
            .map((v) => new BigNumber(v!))
            .filter((v) => !v.isNaN())
            .orElse(new BigNumber(1))
        );
    });

    const upStep = (event) => {
      let rv = realValue.value;
      if (realValue.value && realValue.value.c === null) {
        rv = new BigNumber(0);
      }
      event.preventDefault();
      event.stopPropagation();
      origin.value.focus();
      change((rv || new BigNumber(0)).plus(realAddStep.value));
    };

    const downStep = (event) => {
      let rv = realValue.value;
      if (realValue.value && realValue.value.c === null) {
        rv = new BigNumber(0);
      }
      event.preventDefault();
      event.stopPropagation();
      origin.value.focus();
      change((rv || new BigNumber(0)).minus(realReduceStep.value));
    };

    const formatterShowThousandth = (val: string): string => {
      if (props.showThousandth) {
        const vs = val.split('.');
        let fv = vs[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (val.indexOf('.') !== -1) {
          fv += '.';
        }
        fv += vs[1] || '';
        return fv;
      }
      return val;
    };

    const parserShowThousandth = (val: string): string => {
      return val.replace(/,/g, '');
    };

    const fetchFormatterValue = (val: BigNumber | string | number | null | undefined): string => {
      let fv: string | undefined = '';
      if (isNil(val)) {
        return '';
      }
      if (isString(val)) {
        if (val === '-' || val === '-0' || val.endsWith('.')) {
          fv = val;
        }
      }
      if (isEmpty(fv)) {
        fv = val.toString();
      }
      if (props.formatter) {
        return props.formatter(fv);
      }
      return formatterShowThousandth(fv);
    };

    const fetchParserValue = (val: string | undefined): string => {
      let fv: string | undefined;
      if (isNil(val)) {
        fv = '';
      } else {
        fv = val.toString();
      }
      if (props.parser) {
        return props.parser(fv);
      }
      return parserShowThousandth(fv);
    };

    const autocorrection = (): BigNumber | undefined => {
      const rv = realValue.value;
      let fv: BigNumber | undefined;
      if (isNil(rv) || rv.isNaN()) {
        fv = undefined;
      } else if (!compareToMinValue(rv)) {
        const rmv = realMinValue.value;
        if (isNil(rmv) || rmv.isSafeInteger) {
          return;
        }
        fv = rmv.value;
      } else if (!compareToMaxValue(rv)) {
        const rmv = realMaxValue.value;
        if (isNil(rmv) || rmv.isSafeInteger) {
          return;
        }
        fv = rmv.value;
      } else {
        fv = rv;
      }
      return fv;
    };

    const focus = (event: Event) => {
      focused.value = true;
      context.emit('focus', event);
    };

    const blur = (event: Event) => {
      focused.value = false;
      let fv: BigNumber | undefined;
      let isModify = false;
      if (props.autocorrection) {
        fv = autocorrection();
        if (!isNil(fv)) {
          isModify = true;
        }
      }
      if (isModify) {
        change(fv);
      }
      context.emit('blur', event);
    };

    context.expose({
      getRealValue: (): BigNumber | undefined => realValue.value,
      setValue,
      autocorrection
    });

    return {
      origin,
      realValue,
      focused,
      setValue,
      upStep,
      downStep,
      fetchFormatterValue,
      fetchParserValue,
      focus,
      blur
    };
  },
  render() {
    const slots: Record<string, Slot> = PropRecordHelper.collectionSlots(this.$slots, [
      'prepend',
      'append',
      'prefix',
      'suffix'
    ]);
    const classList = [`${DEFAULT_PREFIX}-input-number`];
    if (this.hiddenStepHandle || this.disabled || this.readonly) {
      classList.push(`${DEFAULT_PREFIX}-input-number-not-handler`);
    } else {
      const handlerComponent = createVNode(
        'div',
        {
          class: `${DEFAULT_PREFIX}-handler-wrapper`
        },
        [
          createVNode(UpOutlined, {
            class: `${DEFAULT_PREFIX}-handler-up-inner`,
            onClick: this.upStep,
            onMousedown: (e) => e?.preventDefault()
          }),
          createVNode(DownOutlined, {
            class: `${DEFAULT_PREFIX}-handler-down-inner`,
            onClick: this.downStep,
            onMousedown: (e) => e?.preventDefault()
          })
        ]
      );
      const { suffix } = slots;
      if (suffix) {
        slots.suffix = () => [...suffix(), handlerComponent];
      } else {
        slots.suffix = () => [handlerComponent];
      }
    }
    if (this.unit) {
      const unitComponent = createVNode(
        'div',
        {
          class: `${DEFAULT_PREFIX}-unit`
        },
        this.unit
      );
      const { append } = slots;
      if (append) {
        slots.append = () => [...append(), unitComponent];
      } else {
        slots.append = () => [unitComponent];
      }
    }
    const { value } = this;
    let fv: string | undefined;
    if (isString(value)) {
      const vsl = value.split('.').length;
      if (value === '-' || value === '-0' || vsl === 2) {
        fv = value;
      }
    }
    if (isEmpty(fv)) {
      const rv = this.realValue;
      if (isNil(rv)) {
        fv = '';
      } else {
        fv = rv.toString();
      }
    }
    fv = this.focused ? fv : this.fetchFormatterValue(fv);
    return createVNode(
      OioInput,
      {
        value: fv,
        defaultValue: Optional.ofNullable(this.defaultValue)
          .map((v) => new BigNumber(v!))
          .filter((v) => !v.isNaN())
          .map<string | undefined>((v) => v.toString())
          .map((v) => (this.focused ? v : this.fetchFormatterValue(v)))
          .orElse(undefined),
        placeholder: this.placeholder,
        disabled: this.disabled,
        readonly: this.readonly,
        allowClear: false,
        ...this.$attrs,
        'onUpdate:value': (val) => this.setValue(val),
        onFocus: this.focus,
        onBlur: this.blur,
        class: StringHelper.append(classList, CastHelper.cast(this.$attrs.class)),
        ref: 'origin'
      },
      slots
    );
  }
});
</script>
