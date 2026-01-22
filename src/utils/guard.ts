export type Dict<T = unknown> = Record<string, T>;
export type List<T = unknown> = T[];

export const isDev = () => process.env.NODE_ENV !== "production";
export const isArray = (v: unknown): v is List => Array.isArray(v);
export const isBoolean = (v: unknown): v is boolean => v === true || v === false;
export const isObjectLike = (v: unknown): v is Dict => v != null && typeof v === "object";
export const isObject = (v: unknown): v is Dict => isObjectLike(v) && !isArray(v);
export const isNumber = (v: unknown): v is number => typeof v === "number" && !Number.isNaN(v);
export const isString = (v: unknown): v is string => typeof v === "string";
export const isFunction = (v: unknown): v is Function => typeof v === "function";
export const isNull = (v: unknown): v is null | undefined => v == null;

// Helper function for equality checking
export function isEqual(a: unknown, b: unknown, visited = new Map<object, object>()): boolean {
  // Direct comparison for primitives
  if (a === b) {
    return true;
  }

  // Handle nullish values
  if (a == null || b == null) {
    return a === b;
  }

  // Handle NaN
  if (isNumber(a) && isNumber(b) && Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }

  // Both values must be objects or arrays for deep comparison
  if (!isObjectLike(a) || !isObjectLike(b)) {
    return false;
  }

  const aObj = a as object;
  const bObj = b as object;

  // Check for circular references
  if (visited.has(aObj)) {
    return visited.get(aObj) === bObj;
  }
  visited.set(aObj, bObj);

  // Handle arrays
  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((val, idx) => isEqual(val, b[idx], visited));
  }

  // Handle Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle RegExp
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }

  // Handle Maps
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) {
      return false;
    }
    for (const [key, val] of a.entries()) {
      if (!b.has(key) || !isEqual(val, b.get(key), visited)) {
        return false;
      }
    }
    return true;
  }

  // Handle Sets
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) {
      return false;
    }
    // Convert to arrays for deep comparison
    return isEqual([...a], [...b], visited);
  }

  // Standard object comparison
  const keysA = Object.keys(aObj);
  const keysB = Object.keys(bObj);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every((key) => Object.hasOwn(bObj, key) && isEqual(aObj[key as keyof typeof aObj], bObj[key as keyof typeof bObj], visited));
}

export const hasProp = <T extends string>(obj: unknown, prop: T): obj is Record<T, unknown> => Object.hasOwn(obj as object, prop);

const baseGetTag = (v: unknown) => Object.prototype.toString.call(v);
const fnToString = Function.prototype.toString;
const objectCtorString = fnToString.call(Object);

export const isPlainObject = (v: unknown) => {
  if (!isObjectLike(v) || baseGetTag(v) !== "[object Object]") {
    return false;
  }
  const proto = Object.getPrototypeOf(v);
  if (proto === null) {
    return true;
  }
  const Ctor = hasProp(proto, "constructor") && proto.constructor;
  return typeof Ctor === "function" && Ctor instanceof Ctor && fnToString.call(Ctor) === objectCtorString;
};
