"use client";

import { useEffect, useState } from "react";

export type HookReturnType<T> = {
  result: T;
  isLoading: boolean;
  error: Error | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Hookify<Args extends any[], T>(
  asyncFunction: (...args: Args) => Promise<T>,
  initialValue: T,
) {
  return (...args: Args): HookReturnType<T> => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [result, setResult] = useState<T>(initialValue);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [error, setError] = useState<Error | null>(null);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setIsLoading(true);
      asyncFunction(...args)
        .then((data) => {
          setResult(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, args);

    return { result, isLoading, error };
  };
}
