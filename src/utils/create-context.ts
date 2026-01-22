import { createElement, createContext as createReactContext, useContext, useDebugValue, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { isEqual } from "./guard";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreateContextOptions<T> {
  /**
   * If true, throws an error if the hook is used outside the Provider.
   * @default true
   */
  strict?: boolean;
  /**
   * Name used in error messages (e.g. "useCounterContext").
   */
  hookName?: string;
  /**
   * Name used in error messages (e.g. "CounterContextProvider").
   */
  providerName?: string;
  /**
   * Custom error message to display when strict mode fails.
   */
  errorMessage?: string;
  /**
   * The display name of the Context object in React DevTools.
   */
  name?: string;
  /**
   * The fallback value if used outside a provider (only if strict=false).
   */
  defaultValue?: T;
}

type Listener = () => void;
type Selector<T, S> = (state: T) => S;
type Unsubscribe = () => void;

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

/**
 * A minimal external store that holds state and notifies listeners of changes.
 * This decouples state updates from React's render cycle, allowing for
 * fine-grained subscriptions via useSyncExternalStore.
 */
export class Store<T = unknown> {
  private value: T;
  private listeners: Set<Listener> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  /**
   * Returns the current state snapshot.
   * Used by useSyncExternalStore to determine if a re-render is needed.
   */
  getValue = (): T => {
    // Safety check: fail fast if accessing a destroyed store
    if (this.value === null) {
      // You might decide to return a default or throw,
      // but typically this won't happen if React lifecycle is correct.
      // For type safety, we cast, or you can change return type to T | null
      return undefined as unknown as T;
    }
    return this.value;
  };

  /**
   * Updates the store value and notifies all subscribers.
   * Note: This does NOT immediately trigger a React re-render.
   * React will only re-render components whose *selected* state has changed.
   */
  setValue = (newValue: T): void => {
    if (!isEqual(this.value, newValue)) {
      this.value = newValue;
      this.notify();
    }
  };

  /**
   * Subscribes a listener to store updates.
   * @returns A cleanup function to unsubscribe.
   */
  subscribe = (listener: Listener): Unsubscribe => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  destroy(): void {
    this.listeners.clear();
    // Release the heavy data immediately
    this.value = undefined as unknown as T;
  }
}

// ============================================================================
// CUSTOM HOOK: useSyncExternalStoreWithSelector
// ============================================================================

/**
 * A custom hook that wraps useSyncExternalStore to add selector and equality check support.
 * * Includes:
 * 1. Selector Stability: Handles inline selector functions safely.
 * 2. Result Caching: Prevents re-renders if the selected slice hasn't changed.
 * 3. DevTools: Displays the selected value in React DevTools.
 */
function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: (() => Snapshot) | undefined,
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
  // 1. Ref-based stability: Allows 'selector' to be an inline function
  // without destabilizing the 'getSelection' reference.
  const selectorRef = useRef(selector);
  const isEqualRef = useRef(isEqual);

  // 2. Cache the last result to prevent unnecessary re-renders
  const instRef = useRef<{
    hasValue: boolean;
    value: Selection | undefined;
    snapshot: Snapshot | undefined;
  }>({ hasValue: false, value: undefined, snapshot: undefined });

  // Update refs synchronously if possible, or via effect
  // We update refs in render to ensure the 'getSelection' below always uses latest logic
  selectorRef.current = selector;
  isEqualRef.current = isEqual;

  const getSelection = useMemo(() => {
    return () => {
      const nextSnapshot = getSnapshot();
      const prevSnapshot = instRef.current.snapshot;
      const prevSelection = instRef.current.value;

      // A. If snapshot reference hasn't changed, return cached selection
      if (instRef.current.hasValue && Object.is(prevSnapshot, nextSnapshot)) {
        return prevSelection as Selection;
      }

      // B. Compute new selection
      const nextSelection = selectorRef.current(nextSnapshot);

      // C. If we have a previous value, check for Deep Equality
      if (instRef.current.hasValue && prevSelection !== undefined && isEqualRef.current && isEqualRef.current(prevSelection, nextSelection)) {
        // Return the OLD instance so React sees no change.
        // We update the snapshot ref so we don't re-run the selector next time.
        instRef.current.snapshot = nextSnapshot;
        return prevSelection;
      }

      // D. Value has truly changed
      instRef.current = {
        hasValue: true,
        value: nextSelection,
        snapshot: nextSnapshot,
      };
      return nextSelection;
    };
  }, [getSnapshot]); // Only re-create if the store's getSnapshot changes

  const getServerSelection = getServerSnapshot ? () => selectorRef.current(getServerSnapshot()) : undefined;

  const value = useSyncExternalStore(subscribe, getSelection, getServerSelection);

  // Debugging aid
  useDebugValue(value);

  return value;
}

// ============================================================================
// HELPERS
// ============================================================================

function getErrorMessage(hook: string, provider: string) {
  return `${hook} returned \`undefined\`. Seems you forgot to wrap component within ${provider}`;
}

const IDENTITY_SELECTOR = <T>(state: T): T => state;

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Creates a high-performance Context that allows components to subscribe to
 * specific slices of state, avoiding unnecessary re-renders.
 *
 * @example
 * const [Provider, useStore] = createContext<State>({ name: "MyStore" });
 *
 * // Only re-renders if 'count' changes
 * const count = useStore(state => state.count);
 *
 * // ⚠️ HYDRATION WARNING:
 * The initial value passed to the Provider MUST be identical on the Server and Client
 * during the first render to avoid Hydration Mismatch errors.
 *
 * If you need to initialize from localStorage/window, use a useEffect inside your
 * component to update the state *after* mount.
 */
export function createContext<T>(options: CreateContextOptions<T> = {}) {
  options.hookName = options.hookName ?? `use${options.name ?? "Context"}`;
  options.providerName = options.providerName ?? `${options.name ?? "Context"}Provider`;
  const { name, strict = true, hookName, providerName, errorMessage, defaultValue } = options;

  const Context = createReactContext<Store<T> | null>(null);
  Context.displayName = name;

  /**
   * The Provider component. It holds the Store instance.
   * Unlike standard React Context, updating the 'value' prop here
   * does NOT trigger a re-render of all children. It only updates the internal store.
   */
  function Provider({ children, value }: { children: React.ReactNode; value: T }) {
    const storeRef = useRef<Store<T> | null>(null);

    // Lazy initialization ensures the store is created once
    if (!storeRef.current) {
      storeRef.current = new Store<T>(value ?? (defaultValue as T));
    }

    // Sync props changes to the store
    useEffect(() => {
      storeRef.current?.setValue(value);
    }, [value]);

    useEffect(() => {
      return () => {
        storeRef.current?.destroy();
      };
    }, []);

    return createElement(Context.Provider, { value: storeRef.current }, children);
  }

  /**
   * The Hook to access the store.
   *
   * @param selector - A function to select a specific part of the state.
   */
  function useContextSelector<S = T>(selector: Selector<T, S> = IDENTITY_SELECTOR as Selector<T, S>): S {
    const store = useContext(Context);

    // 1. Handle strict mode / missing store
    if (strict && !store) {
      const error = new Error(errorMessage ?? getErrorMessage(hookName, providerName));
      error.name = "ContextError";
      throw error;
    }

    // 2. Define State Accessors
    const subscribe = store ? store.subscribe : () => () => {};
    const getSnapshot = store ? store.getValue : () => defaultValue as T;

    // 3. useSyncExternalStoreWithSelector
    return useSyncExternalStoreWithSelector(
      subscribe,
      getSnapshot,
      getSnapshot, // getServerSnapshot (Must match client initial value!)
      selector,
      isEqual,
    );
  }

  return [Provider, useContextSelector, Context] as const;
}
