import { useRef } from "react";

export const useDebounce = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (fn: Function, delayMs: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fn();
    }, delayMs);
  };
};
