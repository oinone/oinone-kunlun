export interface ReloadMaskCallChainingParameters {
  module: string;
  model: string;
  action: string;

  previousPage?: Record<string, unknown>;
  currentPage: Record<string, unknown>;
}

export function getReloadMaskParameters(args: unknown[] | undefined): ReloadMaskCallChainingParameters {
  const parameters = args?.[0] as ReloadMaskCallChainingParameters | undefined;
  if (parameters == null) {
    throw new Error('Invalid refresh main view parameters');
  }
  return parameters;
}

export interface ReloadMainViewCallChainingParameters {
  handle: string;
  module: string;
  model: string;
  action: string;

  viewType?: string;
  target?: string;

  previousPage?: Record<string, unknown>;
  currentPage: Record<string, unknown>;
}

export function getReloadMainViewParameters(args: unknown[] | undefined): ReloadMainViewCallChainingParameters {
  const parameters = args?.[0] as ReloadMainViewCallChainingParameters | undefined;
  if (parameters == null) {
    throw new Error('Invalid refresh main view parameters');
  }
  return parameters;
}
