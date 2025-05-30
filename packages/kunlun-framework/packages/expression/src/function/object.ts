export const OBJECT_FUNCTION = {
  IS_NULL,
  EQUALS,
  GET,
  FIELD_GET
};

function IS_NULL(obj: unknown) {
  return obj == null;
}

function EQUALS(obj1: unknown, obj2: unknown) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function GET(obj: Record<string, unknown>, path: string) {
  return FIELD_GET(obj, undefined, path);
}

function FIELD_GET(obj: Record<string, unknown>, model: string | undefined, path: string) {
  if (obj == null) {
    return obj;
  }
  if (path == null) {
    return undefined;
  }
  const paths = path.split('.');
  let res = obj;
  for (const item in paths) {
    if (item) {
      res = res[item] as Record<string, unknown>;
      if (res == null) {
        return undefined;
      }
    }
  }
  return res;
}
