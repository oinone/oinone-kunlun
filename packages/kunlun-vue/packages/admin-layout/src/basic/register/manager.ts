export interface IMaskTagManager<Component = unknown> {
  getComponents(): Component[];

  isInternalWidget(dslNodeType: string): boolean;

  register(dslNodeType: string): boolean;
}

let maskTagManagerInstance: IMaskTagManager | undefined;

export function getMaskTagManagerInstance<Component = unknown>() {
  return maskTagManagerInstance as IMaskTagManager<Component>;
}

export function setMaskTagManagerInstance(instance: IMaskTagManager) {
  maskTagManagerInstance = instance;
}
