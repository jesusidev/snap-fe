import type { UseFormReturnType } from '@mantine/form';
import { useEffect, useRef } from 'react';

interface UseFormInitializationOptions<TForm, TData> {
  form: UseFormReturnType<TForm>;
  opened: boolean;
  isLoading: boolean;
  data: TData | undefined | null;
  getValues: (data: TData) => Partial<TForm>;
  onInitialized?: () => void;
  deps?: unknown[];
}

/**
 * Safely initialize form values from async data once per modal open.
 * Prevents the infinite loop caused by including `form` in useEffect deps.
 */
export function useFormInitialization<TForm, TData>({
  form,
  opened,
  isLoading,
  data,
  getValues,
  onInitialized,
  deps = [],
}: UseFormInitializationOptions<TForm, TData>): void {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!opened) {
      initializedRef.current = false;
    }
  }, [opened]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: form object causes infinite loops
  useEffect(() => {
    if (opened && !isLoading && data && !initializedRef.current) {
      const values = getValues(data);
      form.setValues(values);
      initializedRef.current = true;
      onInitialized?.();
    }
  }, [opened, isLoading, data, ...deps]);
}
