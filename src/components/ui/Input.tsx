import React from 'react';
import clsx from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={clsx(
          'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-2 focus:border-primary focus:ring-2 focus:ring-primary/30',
          className
        )}
        {...props}
      />
    </div>
  );
}
