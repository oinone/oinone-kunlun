import _objectSpread from '@babel/runtime/helpers/esm/objectSpread2';
import classNames from 'ant-design-vue/es/_util/classNames';
import { skipFlattenKey } from 'ant-design-vue/es/_util/props-util';
import { cloneElement } from 'ant-design-vue/es/_util/vnode';
import PropTypes from 'ant-design-vue/es/_util/vue-types';
import placements from 'ant-design-vue/es/vc-dropdown/placements';
import { createVNode as _createVNode, Fragment as _Fragment, computed, defineComponent, ref, watch } from 'vue';
import Trigger from './Trigger.js';

var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };

export default defineComponent({
  compatConfig: {
    MODE: 3
  },
  props: {
    minOverlayWidthMatchTrigger: {
      type: Boolean,
      default: undefined
    },
    arrow: {
      type: Boolean,
      default: false
    },
    prefixCls: PropTypes.string.def('rc-dropdown'),
    transitionName: String,
    overlayClassName: PropTypes.string.def(''),
    openClassName: String,
    animation: PropTypes.any,
    align: PropTypes.object,
    overlayStyle: {
      type: Object,
      default: undefined
    },
    placement: PropTypes.string.def('bottomLeft'),
    overlay: PropTypes.any,
    trigger: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).def('hover'),
    alignPoint: {
      type: Boolean,
      default: undefined
    },
    showAction: PropTypes.array,
    hideAction: PropTypes.array,
    getPopupContainer: Function,
    visible: {
      type: Boolean,
      default: undefined
    },
    defaultVisible: {
      type: Boolean,
      default: false
    },
    mouseEnterDelay: PropTypes.number.def(0.15),
    mouseLeaveDelay: PropTypes.number.def(0.1)
  },
  emits: ['visibleChange', 'overlayClick'],
  setup(props, _ref) {
    let { slots, emit, expose } = _ref;
    const triggerVisible = ref(!!props.visible);
    watch(
      () => props.visible,
      (val) => {
        if (val !== undefined) {
          triggerVisible.value = val;
        }
      }
    );
    const triggerRef = ref();
    expose({
      triggerRef
    });
    const onClick = (e) => {
      if (props.visible === undefined) {
        triggerVisible.value = false;
      }
      emit('overlayClick', e);
    };
    const onVisibleChange = (visible) => {
      if (props.visible === undefined) {
        triggerVisible.value = visible;
      }
      emit('visibleChange', visible);
    };
    const getMenuElement = () => {
      var _a;
      const overlayElement = (_a = slots.overlay) === null || _a === void 0 ? void 0 : _a.call(slots);
      const extraOverlayProps = {
        prefixCls: `${props.prefixCls}-menu`,
        onClick
      };
      return _createVNode(
        _Fragment,
        {
          key: skipFlattenKey
        },
        [
          props.arrow &&
            _createVNode(
              'div',
              {
                class: `${props.prefixCls}-arrow`
              },
              null
            ),
          cloneElement(overlayElement, extraOverlayProps, false)
        ]
      );
    };
    const minOverlayWidthMatchTrigger = computed(() => {
      const { minOverlayWidthMatchTrigger: matchTrigger = !props.alignPoint } = props;
      return matchTrigger;
    });
    const renderChildren = () => {
      var _a;
      const children = (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots);
      return triggerVisible.value && children
        ? cloneElement(
            children[0],
            {
              class: props.openClassName || `${props.prefixCls}-open`
            },
            false
          )
        : children;
    };
    const triggerHideAction = computed(() => {
      if (!props.hideAction && props.trigger.indexOf('contextmenu') !== -1) {
        return ['click'];
      }
      return props.hideAction;
    });
    return () => {
      const {
          prefixCls,
          arrow,
          showAction,
          overlayStyle,
          trigger,
          placement,
          align,
          getPopupContainer,
          transitionName,
          animation,
          overlayClassName
        } = props,
        otherProps = __rest(props, [
          'prefixCls',
          'arrow',
          'showAction',
          'overlayStyle',
          'trigger',
          'placement',
          'align',
          'getPopupContainer',
          'transitionName',
          'animation',
          'overlayClassName'
        ]);
      return _createVNode(
        Trigger,
        _objectSpread(
          _objectSpread({}, otherProps),
          {},
          {
            prefixCls: prefixCls,
            ref: triggerRef,
            popupClassName: classNames(overlayClassName, {
              [`${prefixCls}-show-arrow`]: arrow
            }),
            popupStyle: overlayStyle,
            builtinPlacements: placements,
            action: trigger,
            showAction: showAction,
            hideAction: triggerHideAction.value || [],
            popupPlacement: placement,
            popupAlign: align,
            popupTransitionName: transitionName,
            popupAnimation: animation,
            popupVisible: triggerVisible.value,
            stretch: minOverlayWidthMatchTrigger.value ? 'minWidth' : '',
            onPopupVisibleChange: onVisibleChange,
            getPopupContainer: getPopupContainer
          }
        ),
        {
          popup: getMenuElement,
          default: renderChildren
        }
      );
    };
  }
});
