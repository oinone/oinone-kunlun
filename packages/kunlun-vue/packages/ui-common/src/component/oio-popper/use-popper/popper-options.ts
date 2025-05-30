import { PopperPosition, PopperRelative, PopperRelativePosition, PopperTriggerType } from '../props';

export default interface PopperOptions {
  visible?: boolean;
  disabled: boolean;
  trigger: PopperTriggerType | PopperTriggerType[];
  relative: PopperRelative;
  relativePosition: PopperRelativePosition;
  offsetPosition?: PopperPosition;
  destroyOnHide: boolean;
}
