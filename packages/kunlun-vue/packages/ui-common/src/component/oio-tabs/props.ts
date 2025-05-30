import { PropType } from 'vue';
import { OioBaseContainerProps, OioComponentData } from '../../typing';

export const DEFAULT_TABS_TITLE = '选项卡';

export const DEFAULT_TAB_TITLE = '选项页';

export enum OioTabPosition {
  /**
   * @deprecated please use OioTabPosition#top
   */
  TOP = 'top',
  /**
   * @deprecated please use OioTabPosition#right
   */
  RIGHT = 'right',
  /**
   * @deprecated please use OioTabPosition#bottom
   */
  BOTTOM = 'bottom',
  /**
   * @deprecated please use OioTabPosition#left
   */
  LEFT = 'left',

  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left'
}

export type $$OioTabPosition = keyof Omit<typeof OioTabPosition, 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT'>;

export enum OioTabAlign {
  /**
   * @deprecated please use OioTabAlign#left
   */
  LEFT = 'left',
  /**
   * @deprecated please use OioTabAlign#center
   */
  CENTER = 'center',
  /**
   * @deprecated please use OioTabAlign#right
   */
  RIGHT = 'right',
  /**
   * @deprecated please use OioTabAlign#top
   */
  TOP = 'top',
  /**
   * @deprecated please use OioTabAlign#middle
   */
  MIDDLE = 'middle',
  /**
   * @deprecated please use OioTabAlign#bottom
   */
  BOTTOM = 'bottom',

  left = 'left',
  center = 'center',
  right = 'right',
  top = 'top',
  middle = 'middle',
  bottom = 'bottom'
}

export enum OioTabsType {
  line = 'line',
  card = 'card',
  'editable-card' = 'editable-card'
}

export const OioTabsProps = {
  ...OioComponentData,
  ...OioBaseContainerProps,
  id: {
    type: String
  },
  activeKey: {
    type: [String, Number]
  },
  tabPosition: {
    type: String as PropType<OioTabPosition | $$OioTabPosition>,
    default: OioTabPosition.top
  },
  verticalHeight: {
    type: [Number, String]
  },
  destroyInactiveTabPane: {
    type: Boolean,
    default: false
  },
  type: {
    type: String as PropType<OioTabsType | keyof typeof OioTabsType>
  }
};

export const OioTabProps = {
  ...OioComponentData,
  ...OioBaseContainerProps,
  key: {
    type: String
  },
  tab: {
    type: [String, Object]
  },
  forceRender: {
    type: Boolean,
    default: undefined
  }
};
