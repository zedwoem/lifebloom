import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-brand-green text-white hover:bg-brand-green-hover focus:ring-brand-green/30 shadow-md hover:shadow-lg",
      secondary: "bg-brand-blue text-white hover:bg-brand-blue-hover focus:ring-brand-blue/30 shadow-md hover:shadow-lg",
      outline: "bg-white text-brand-slate border-2 border-brand-slate-light hover:border-brand-green hover:text-brand-green focus:ring-brand-green/20",
      danger: "bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-300"
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base min-h-[48px]", // 48px min touch target for accessibility
      lg: "px-8 py-4 text-lg min-h-[56px]"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
