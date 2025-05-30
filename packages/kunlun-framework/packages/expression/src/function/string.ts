export const STRING_FUNCTION = {
  TRIM,
  IS_BLANK,
  STARTS_WITH,
  ENDS_WITH,
  CONTAINS,
  STR_LIST_CONTAINS,
  LOWER,
  UPPER,
  REPLACE,
  LEN,
  JOIN,
  PARSE: JSON_PARSE,
  JSON: JSON_STRINGIFY,
  SUBSTRING
};

function TRIM(str: string) {
  if (str == null) {
    return str;
  }
  return str.trim();
}

function IS_BLANK(str: string) {
  if (str == null) {
    return true;
  }
  return str.trim() === '';
}

function STARTS_WITH(str: string, start: string) {
  if (str == null) {
    str = '';
  }
  return str.startsWith(start);
}

function ENDS_WITH(str: string, end: string) {
  if (str == null) {
    str = '';
  }
  return str.endsWith(end);
}

function CONTAINS(str: string, subtext: string) {
  if (str == null) {
    return false;
  }
  return str.includes(subtext);
}

function STR_LIST_CONTAINS(str: string, obj: Record<string, unknown>, field: string) {
  return str!.split(',').includes(obj[field] as string);
}

function LOWER(str: string) {
  if (str == null) {
    return str;
  }
  return str.toLowerCase();
}

function UPPER(str: string) {
  if (str == null) {
    return str;
  }
  return str.toUpperCase();
}

function REPLACE(str: string, oldStr: string, newStr: string) {
  if (str == null) {
    return str;
  }
  return str.replace(oldStr, newStr);
}

function LEN(str: string) {
  if (str == null) {
    return 0;
  }
  return str.length;
}

function JOIN(str: string, join: string) {
  if (str == null) {
    str = '';
  }
  if (join == null) {
    join = '';
  }
  return str + join;
}

function JSON_PARSE(str: string) {
  if (str == null) {
    return str;
  }
  return JSON.parse(str);
}

function JSON_STRINGIFY(obj: unknown) {
  if (obj == null) {
    return obj;
  }
  return JSON.stringify(obj);
}

function SUBSTRING(str: string, start: number, end: number) {
  return str?.substring(start, end);
}
