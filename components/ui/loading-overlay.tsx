import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LoadingIndicator } from "./loading-spinner"
import { Button } from "./button"
import { X } from "lucide-react"
import { LoadingOverlayProps } from "@/types/loading"

const overlayVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center p-4",
  {
    variants: {
      variant: {
        modal: "bg-black/80 backdrop-blur-sm",
        inline: "bg-background/80 backdrop-blur-sm rounded-lg border",
        fullscreen: "bg-background",
      }
    },
    defaultVariants: {
      variant: "modal"
    }
  }
)

const contentVariants = cva(
  "flex flex-col items-center justify-center text-center space-y-4 p-6 rounded-lg",
  {
    variants: {
      variant: {
        modal: "bg-background border shadow-lg max-w-sm w-full",
        inline: "bg-transparent max-w-xs w-full",
        fullscreen: "max-w-md w-full",
      }
    },
    defaultVariants: {
      variant: "modal"
    }
  }
)

export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    isVisible,
    operation,
    message,
    progress,
    variant = "modal",
    className,
    onCancel,
    showCancel = false,
    ...props
  }, ref) => {
    if (!isVisible) return null

    const handleCancel = () => {
      if (onCancel) {
        onCancel()
      }
    }

    return (
      <div
        ref={ref}
        className={cn(overlayVariants({ variant }), className)}
        {...props}
      >
        <div className={cn(contentVariants({ variant }))}>
          {/* Cancel button for modal variant */}
          {showCancel && onCancel && variant === "modal" && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          )}

          {/* Loading indicator */}
          <LoadingIndicator
            operation={operation}
            size="lg"
            variant="spinner"
            showMessage={true}
            message={message}
            progress={progress}
          />

          {/* Cancel button for inline/fullscreen variants */}
          {showCancel && onCancel && variant !== "modal" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="mt-4"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    )
  }
)
LoadingOverlay.displayName = "LoadingOverlay"

// Specific overlay for authentication operations
interface AuthLoadingOverlayProps extends Omit<LoadingOverlayProps, 'operation'> {
  operation?: 'signIn' | 'signUp' | 'signOut' | 'resetPassword' | 'sendMagicLink' | 'updateProfile'
  autoMessage?: boolean
}

export const AuthLoadingOverlay = React.forwardRef<HTMLDivElement, AuthLoadingOverlayProps>(
  ({ 
    operation,
    message,
    autoMessage = true,
    ...props
  }, ref) => {
    // Auto-generate message based on operation if autoMessage is true
    const getAutoMessage = () => {
      if (!autoMessage || message) return message
      
      switch (operation) {
        case 'signIn':
          return 'Signing you in...'
        case 'signUp':
          return 'Creating your account...'
        case 'signOut':
          return 'Signing you out...'
        case 'resetPassword':
          return 'Sending password reset email...'
        case 'sendMagicLink':
          return 'Sending magic link...'
        case 'updateProfile':
          return 'Updating your profile...'
        default:
          return 'Loading...'
      }
    }

    return (
      <LoadingOverlay
        ref={ref}
        operation={operation}
        message={getAutoMessage()}
        {...props}
      />
    )
  }
)
AuthLoadingOverlay.displayName = "AuthLoadingOverlay"

// Page-level loading component
interface LoadingPageProps {
  title?: string
  message?: string
  showProgress?: boolean
  progress?: number
  className?: string
}

export const LoadingPage = React.forwardRef<HTMLDivElement, LoadingPageProps>(
  ({ 
    title = "Loading",
    message = "Please wait while we load your content...",
    showProgress = false,
    progress,
    className,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4",
          className
        )}
        {...props}
      >
        <div className="text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          
          <LoadingIndicator
            size="lg"
            variant="spinner"
            showMessage={true}
            message={message}
            progress={showProgress ? progress : undefined}
            className="mb-4"
          />
          
          {showProgress && progress !== undefined && (
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          )}
        </div>
      </div>
    )
  }
)
LoadingPage.displayName = "LoadingPage"

export { overlayVariants, contentVariants }