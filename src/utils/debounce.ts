/**
 * Creates a debounced version of a function that delays its execution
 * until after `wait` milliseconds have elapsed since the last time it was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function
 */
// @ai-link name=debounce
// @ai-depends on=clearTimeout,setTimeout
// @ai-related NodeJS.Timeout
// @ai-exec utility,performance,throttling
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;

  // @ai-link name=debounced
  // @ai-depends on=clearTimeout,setTimeout,func
  // @ai-related debounce
  // @ai-exec utility,internal
  return function debounced(...args: Parameters<T>): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(undefined, args);
    }, wait);
  };
} 