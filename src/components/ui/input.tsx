import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    const generatedId = React.useId();
    const id = props.id || generatedId;
    
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className="font-semibold text-foreground text-[16px] block">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all min-h-[52px]
            focus:outline-none focus:ring-4
            ${error 
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200' 
              : 'border-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/25'
            }
            disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-rose-500 mt-1">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"
