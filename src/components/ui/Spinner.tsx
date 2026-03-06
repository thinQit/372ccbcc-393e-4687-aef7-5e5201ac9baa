import React from 'react';
import clsx from 'clsx';

type SpinnerProps = React.SVGAttributes<SVGSVGElement>;

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx('h-4 w-4 animate-spin text-slate-500', className)}
      fill="none"
      {...props}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
