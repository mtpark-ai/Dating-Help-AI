import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Spinner } from "./loading-spinner"
import { LoadingButtonProps } from "@/types/loading"

const loadingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    isLoading = false,
    loadingText,
    showSpinner = true,
    operation,
    children,
    disabled,
    ...props 
  }, ref) => {
    const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm'
    const isDisabled = disabled || isLoading
    
    // Determine spinner variant based on button variant
    const spinnerVariant = variant === 'outline' || variant === 'ghost' || variant === 'link' 
      ? 'current' 
      : 'white'

    return (
      <button
        className={cn(loadingButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && showSpinner && (
          <Spinner 
            size={spinnerSize} 
            variant={spinnerVariant}
            className="flex-shrink-0"
          />
        )}
        
        <span className={cn(
          "flex items-center gap-2",
          isLoading && "opacity-70"
        )}>
          {isLoading && loadingText ? loadingText : children}
        </span>
      </button>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

// Enhanced button with operation-specific loading states
export interface AuthLoadingButtonProps extends LoadingButtonProps {
  operation?: 'signIn' | 'signUp' | 'signOut' | 'resetPassword' | 'sendMagicLink'
  successText?: string
  errorText?: string
  showProgress?: boolean
  progress?: number
}

export const AuthLoadingButton = React.forwardRef<HTMLButtonElement, AuthLoadingButtonProps>(
  ({ 
    operation,
    loadingText,
    successText,
    errorText,
    showProgress = false,
    progress,
    children,
    ...props
  }, ref) => {
    // Get operation-specific loading text if not provided
    const getLoadingText = () => {
      if (loadingText) return loadingText
      
      switch (operation) {
        case 'signIn':
          return 'Signing in...'
        case 'signUp':
          return 'Creating account...'
        case 'signOut':
          return 'Signing out...'
        case 'resetPassword':
          return 'Sending reset email...'
        case 'sendMagicLink':
          return 'Sending magic link...'
        default:
          return 'Loading...'
      }
    }

    return (
      <div className="relative">
        <LoadingButton
          ref={ref}
          loadingText={getLoadingText()}
          {...props}
        >
          {children}
        </LoadingButton>
        
        {/* Progress bar overlay */}
        {showProgress && progress !== undefined && props.isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 rounded-b-md overflow-hidden">
            <div
              className="h-full bg-white/30 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    )
  }
)
AuthLoadingButton.displayName = "AuthLoadingButton"

export { loadingButtonVariants }