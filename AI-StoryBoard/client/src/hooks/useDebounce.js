import { useEffect, useState } from 'react';

/**
 * Returns a "settled" version of `value` that only updates once the
 * value has stopped changing for `delayMs`. Used for:
 *  - the backlog search box (don't hit the API on every keystroke)
 *  - story description autosave (don't PATCH on every keystroke either)
 *
 * This is the classic "debounce a value" pattern rather than "debounce
 * a function" -- I find it easier to reason about in React because the
 * debounced value is just... a value, no refs to timers needed at the
 * call site.
 */
export function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer); // reset the timer if value changes again before it fires
  }, [value, delayMs]);

  return debounced;
}
