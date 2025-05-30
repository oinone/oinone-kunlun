let activeDirective = 0;

export enum TriggerDirective {
  IGNORED_THIS = 1,
  IGNORED_DEPS = 2,
  FORCE_THIS = 4,
  FORCE_DEPS = 8
}

export function useTriggerDirective(directive: number, fn: () => void) {
  const lastDirective = activeDirective;
  activeDirective = directive;
  try {
    fn();
  } finally {
    activeDirective = lastDirective;
  }
}

export function clearTriggerDirective(directive: number, fn: () => void) {
  const lastDirective = activeDirective;
  activeDirective &= ~directive;
  try {
    fn();
  } finally {
    activeDirective = lastDirective;
  }
}

export function isUsingTriggerDirective(directive: number): boolean {
  return (activeDirective & directive) > 0;
}
