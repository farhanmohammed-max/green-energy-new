import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const baseFieldClass =
  'w-full rounded-xl border border-forest-900/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed';

const errorFieldClass = 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20';

interface FieldWrapperProps {
  id: string;
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FieldWrapper({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
          {required && (
            <span className="ml-1 text-rose-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, name, label, hint, error, required, className, wrapperClassName, ...props }, ref) => {
    const fieldId = id ?? name ?? 'input';
    return (
      <FieldWrapper
        id={fieldId}
        label={label}
        required={required}
        hint={hint}
        error={error}
        className={wrapperClassName}
      >
        <input
          ref={ref}
          id={fieldId}
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(baseFieldClass, error && errorFieldClass, className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);
Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ id, name, label, hint, error, required, className, wrapperClassName, rows = 4, ...props }, ref) => {
    const fieldId = id ?? name ?? 'textarea';
    return (
      <FieldWrapper
        id={fieldId}
        label={label}
        required={required}
        hint={hint}
        error={error}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={fieldId}
          name={name}
          rows={rows}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(baseFieldClass, 'resize-y min-h-[96px]', error && errorFieldClass, className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, name, label, hint, error, required, className, wrapperClassName, children, ...props }, ref) => {
    const fieldId = id ?? name ?? 'select';
    return (
      <FieldWrapper
        id={fieldId}
        label={label}
        required={required}
        hint={hint}
        error={error}
        className={wrapperClassName}
      >
        <select
          ref={ref}
          id={fieldId}
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(baseFieldClass, 'pr-9', error && errorFieldClass, className)}
          {...props}
        >
          {children}
        </select>
      </FieldWrapper>
    );
  },
);
Select.displayName = 'Select';
