import { useCallback, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFunction<Args extends any[], ReturnType> = (
  ...args: Args
) => Promise<ReturnType>;

//eslint-disable-next-line
export const hookifyFunction = <Args extends any[], ReturnType>(
  feature: AsyncFunction<Args, ReturnType>,
) => {
  // eslint-disable-next-line
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line
  const [error, setError] = useState<Error | null>(null);
  // eslint-disable-next-line
  const [result, setResult] = useState<ReturnType | null>(null);
  // eslint-disable-next-line
  const [isSuccess, setIsSuccess] = useState<undefined | boolean>(undefined);

  const reset = () => {
    setError(null);
    setResult(null);
    setIsLoading(false);
    setIsSuccess(undefined);
  };

  // eslint-disable-next-line
  const wrappedFeature: AsyncFunction<Args, ReturnType> = useCallback(
    async (...args: Args) => {
      reset();
      setIsLoading(true);
      setError(null);
      try {
        const result = await feature(...args);
        setResult(result);
        setIsSuccess(true);
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

  return {
    result,
    isLoading,
    error,
    reset,
    execute: wrappedFeature,
    isSuccess,
  };
};
