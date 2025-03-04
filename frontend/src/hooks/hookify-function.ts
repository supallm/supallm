import { useCallback, useState } from "react";

// Type definition for the return value of the feature function
type AsyncFunction<Args extends any[], ReturnType> = (
  ...args: Args
) => Promise<ReturnType>;

type ResetFunction = () => void;

export const hookifyFunction = <Args extends any[], ReturnType>(
  feature: AsyncFunction<Args, ReturnType>,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ReturnType | null>(null);

  const reset = () => {
    setError(null);
    setResult(null);
    setIsLoading(false);
  };

  const wrappedFeature: AsyncFunction<Args, ReturnType> = useCallback(
    async (...args: Args) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await feature(...args);
        setResult(result);
        return result; // Return the result so it can be used immediately
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        throw e; // Re-throw the error to allow handling by the caller
      } finally {
        setIsLoading(false);
      }
    },
    [feature],
  );

  return { result, isLoading, error, reset, execute: wrappedFeature };
};
