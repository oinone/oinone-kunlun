import { OioComponentData } from '@kunlun/vue-ui-common';
import { OioColumnAppearanceProps } from '../column';

export const OioColgroupControlProps = {
  field: {
    type: String
  }
};

export const OioColgroupProps = {
  ...OioColumnAppearanceProps,
  ...OioColgroupControlProps,
  ...OioComponentData
};
