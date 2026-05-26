import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]";
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-container focus:ring-primary/20 shadow-md hover:shadow-lg",
      secondary: "bg-secondary text-white hover:bg-secondary-container focus:ring-secondary/20 shadow-md hover:shadow-lg",
      outline: "bg-white text-foreground border-2 border-border hover:border-primary hover:text-primary focus:ring-primary/25",
      danger: "bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-300"
    };

    const sizes = {
      sm: "px-4 py-2 text-sm min-h-[40px]",
      md: "px-6 py-3 text-base min-h-[52px]", // Non-negotiable 52px touch-target
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
