"use client";

import { useEffect, useState } from "react";

export type HookReturnType<T> = {
  result: T;
  isLoading: boolean;
  error: Error | null;
};

export function Hookify<Args extends any[], T>(
  asyncFunction: (...args: Args) => Promise<T>,
  initialValue: T,
) {
  return (...args: Args): HookReturnType<T> => {
    const [result, setResult] = useState<T>(initialValue);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

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
    }, args);

    return { result, isLoading, error };
  };
}
