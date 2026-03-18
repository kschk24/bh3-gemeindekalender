import { createContext, useContext, useId, ReactNode, cloneElement, isValidElement, HTMLAttributes } from 'react';

interface FormFieldContextValue {
  id: string;
  errorId: string;
  helperId: string;
  hasError: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormField() {
  const ctx = useContext(FormFieldContext);
  if (!ctx) throw new Error('FormField sub-component must be used inside <FormField>');
  return ctx;
}

interface FormFieldProps {
  children: ReactNode;
  error?: string;
  className?: string;
}

function FormField({ children, error, className = '' }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = !!error;

  return (
    <FormFieldContext.Provider value={{ id, errorId, helperId, hasError }}>
      <div className={`space-y-1 ${className}`}>
        {children}
        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </FormFieldContext.Provider>
  );
}

FormField.Label = function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { id } = useFormField();
  return (
    <label htmlFor={id} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </label>
  );
};

FormField.Control = function Control({ children }: { children: ReactNode }) {
  const { id, errorId, helperId, hasError } = useFormField();

  if (!isValidElement(children)) return <>{children}</>;

  return cloneElement(children as React.ReactElement<HTMLAttributes<HTMLElement> & { id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>, {
    id,
    'aria-invalid': hasError || undefined,
    'aria-describedby': [hasError ? errorId : '', helperId].filter(Boolean).join(' ') || undefined,
  });
};

FormField.Helper = function Helper({ children }: { children: ReactNode }) {
  const { helperId } = useFormField();
  return (
    <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
      {children}
    </p>
  );
};

export default FormField;
