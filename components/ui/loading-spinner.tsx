import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LoadingIndicatorProps } from "@/types/loading"

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-safe:animate-spin",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2", 
        lg: "h-8 w-8 border-3",
        xl: "h-12 w-12 border-4",
      },
      variant: {
        primary: "text-primary",
        secondary: "text-muted-foreground",
        white: "text-white",
        current: "text-current",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  }
)

const dotsVariants = cva(
  "flex items-center space-x-1",
  {
    variants: {
      size: {
        sm: "space-x-1",
        md: "space-x-1.5",
        lg: "space-x-2",
        xl: "space-x-2.5",
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
)

const dotVariants = cva(
  "rounded-full bg-current animate-pulse",
  {
    variants: {
      size: {
        sm: "h-1.5 w-1.5",
        md: "h-2 w-2",
        lg: "h-2.5 w-2.5", 
        xl: "h-3 w-3",
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
)

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string
}

interface DotsProps extends VariantProps<typeof dotsVariants> {
  className?: string
  variant?: 'primary' | 'secondary' | 'white' | 'current'
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant, className }))}
        {...props}
      />
    )
  }
)
Spinner.displayName = "Spinner"

export const LoadingDots = React.forwardRef<HTMLDivElement, DotsProps>(
  ({ className, size, variant = "primary", ...props }, ref) => {
    const dotClass = cn(dotVariants({ size }), {
      'text-primary': variant === 'primary',
      'text-muted-foreground': variant === 'secondary',
      'text-white': variant === 'white',
      'text-current': variant === 'current',
    })

    return (
      <div
        ref={ref}
        className={cn(dotsVariants({ size, className }))}
        {...props}
      >
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={dotClass}
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: '1.4s'
            }}
          />
        ))}
      </div>
    )
  }
)
LoadingDots.displayName = "LoadingDots"

export const LoadingIndicator = React.forwardRef<HTMLDivElement, LoadingIndicatorProps>(
  ({ 
    operation, 
    size = "md", 
    variant = "spinner", 
    showMessage = true, 
    message, 
    progress,
    className,
    ...props 
  }, ref) => {
    const renderIndicator = () => {
      switch (variant) {
        case 'dots':
          return <LoadingDots size={size} variant="current" />
        case 'pulse':
          return (
            <div 
              className={cn(
                "bg-current rounded-full animate-pulse",
                size === 'sm' && "h-4 w-4",
                size === 'md' && "h-6 w-6", 
                size === 'lg' && "h-8 w-8"
              )}
            />
          )
        case 'skeleton':
          return (
            <div 
              className={cn(
                "bg-muted rounded-md animate-pulse",
                size === 'sm' && "h-4 w-16",
                size === 'md' && "h-6 w-24",
                size === 'lg' && "h-8 w-32"
              )}
            />
          )
        default:
          return <Spinner size={size} variant="current" />
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          showMessage && message && "flex-col space-y-2",
          !showMessage || !message && "flex-row space-x-2",
          className
        )}
        {...props}
      >
        {renderIndicator()}
        
        {showMessage && message && (
          <div className="text-center">
            <p className={cn(
              "text-muted-foreground",
              size === 'sm' && "text-xs",
              size === 'md' && "text-sm",
              size === 'lg' && "text-base"
            )}>
              {message}
            </p>
            
            {progress !== undefined && progress >= 0 && progress <= 100 && (
              <div className={cn(
                "mt-2 bg-muted rounded-full overflow-hidden",
                size === 'sm' && "h-1 w-16",
                size === 'md' && "h-2 w-24",
                size === 'lg' && "h-2 w-32"
              )}>
                <div
                  className="bg-primary h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)
LoadingIndicator.displayName = "LoadingIndicator"

export { spinnerVariants, dotsVariants, dotVariants }