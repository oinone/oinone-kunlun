export function isStandardString(val: unknown): val is string {
  if (val == null) {
    return false;
  }
  return typeof val === 'string';
}

export function isStandardNumber(val: unknown): val is string | number {
  if (val == null) {
    return false;
  }
  return ['string', 'number'].includes(typeof val);
}

export function isStandardBoolean(val: unknown): val is string | boolean {
  if (val == null) {
    return false;
  }
  if (typeof val === 'boolean') {
    return true;
  }
  if (typeof val === 'string') {
    return ['true', 'false'].includes(val);
  }
  return false;
}
