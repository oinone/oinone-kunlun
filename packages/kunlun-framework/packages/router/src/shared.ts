/**
 * The primary routing outlet.
 *
 * @publicApi
 */
export const PRIMARY_OUTLET = 'primary';

/**
 * A collection of matrix and query URL parameters.
 * @see `convertToParamMap()`
 * @see `ParamMap`
 *
 * @publicApi
 */
export type Params = {
  [key: string]: unknown;
};

/**
 * A map that provides access to the required and optional parameters
 * specific to a route.
 * The map supports retrieving a single value with `get()`
 * or multiple values with `getAll()`.
 *
 * @see [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
 *
 * @publicApi
 */
export interface ParamMap {
  /**
   * Reports whether the map contains a given parameter.
   * @param name The parameter name.
   * @returns True if the map contains the given parameter, false otherwise.
   */
  has(name: string): boolean;
  /**
   * Retrieves a single value for a parameter.
   * @param name The parameter name.
   * @return The parameter's single value,
   * or the first value if the parameter has multiple values,
   * or `null` when there is no such parameter.
   */
  get(name: string): string | null;
  /**
   * Retrieves multiple values for a parameter.
   * @param name The parameter name.
   * @return An array containing one or more values,
   * or an empty array if there is no such parameter.
   *
   */
  getAll(name: string): string[];

  /** Names of the parameters in the map. */
  readonly keys: string[];
}

class ParamsAsMap implements ParamMap {
  private params: Params;

  public constructor(params: Params) {
    this.params = params || {};
  }

  public has(name: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.params, name);
  }

  public get(name: string): string | null {
    if (this.has(name)) {
      const v = this.params[name];
      return Array.isArray(v) ? v[0] : v;
    }

    return null;
  }

  public getAll(name: string): string[] {
    if (this.has(name)) {
      const v = this.params[name];
      return Array.isArray(v) ? v : [v];
    }

    return [];
  }

  public get keys(): string[] {
    return Object.keys(this.params);
  }
}

/**
 * Converts a `Params` instance to a `ParamMap`.
 * @param params The instance to convert.
 * @returns The new map instance.
 *
 * @publicApi
 */
export function convertToParamMap(params: Params): ParamMap {
  return new ParamsAsMap(params);
}
