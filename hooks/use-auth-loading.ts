'use client'

import { useReducer, useCallback, useMemo, useRef } from 'react'
import { 
  AuthOperation, 
  AuthLoadingContextState, 
  LoadingAction, 
  UseLoadingReturn, 
  LoadingState,
  OPERATION_MESSAGES
} from '@/types/loading'

// Initial state for the loading context
const initialState: AuthLoadingContextState = {
  states: {},
  globalLoading: false,
  hasActiveOperations: false,
  operationQueue: [],
}

// Reducer to manage loading states
function loadingReducer(state: AuthLoadingContextState, action: LoadingAction): AuthLoadingContextState {
  switch (action.type) {
    case 'START_LOADING': {
      const { operation, message, progress } = action
      const newStates = {
        ...state.states,
        [operation]: {
          isLoading: true,
          operation,
          message: message || OPERATION_MESSAGES[operation]?.start || 'Loading...',
          progress: progress || 0,
        }
      }
      
      const operationQueue = state.operationQueue.includes(operation) 
        ? state.operationQueue 
        : [...state.operationQueue, operation]

      return {
        ...state,
        states: newStates,
        globalLoading: true,
        hasActiveOperations: true,
        operationQueue,
      }
    }

    case 'UPDATE_PROGRESS': {
      const { operation, progress, message } = action
      const currentState = state.states[operation]
      
      if (!currentState?.isLoading) {
        return state // Don't update if operation isn't loading
      }

      const newStates = {
        ...state.states,
        [operation]: {
          ...currentState,
          progress,
          message: message || currentState.message,
        }
      }

      return {
        ...state,
        states: newStates,
      }
    }

    case 'FINISH_LOADING': {
      const { operation } = action
      const { [operation]: _, ...remainingStates } = state.states
      const operationQueue = state.operationQueue.filter(op => op !== operation)
      const hasActiveOperations = Object.values(remainingStates).some(s => s?.isLoading === true)

      return {
        ...state,
        states: remainingStates,
        globalLoading: hasActiveOperations,
        hasActiveOperations,
        operationQueue,
      }
    }

    case 'SET_MESSAGE': {
      const { operation, message } = action
      const currentState = state.states[operation]
      
      if (!currentState) {
        return state
      }

      const newStates = {
        ...state.states,
        [operation]: {
          ...currentState,
          message,
        }
      }

      return {
        ...state,
        states: newStates,
      }
    }

    case 'CLEAR_ALL': {
      return initialState
    }

    default:
      return state
  }
}

/**
 * Custom hook for managing authentication loading states
 * Provides centralized loading state management with operation-specific granularity
 */
export function useAuthLoading(): UseLoadingReturn {
  const [state, dispatch] = useReducer(loadingReducer, initialState)
  const timeoutRefs = useRef<Map<AuthOperation, NodeJS.Timeout>>(new Map())

  // Start loading for a specific operation
  const startLoading = useCallback((operation: AuthOperation, message?: string) => {
    // Clear any existing timeout for this operation
    const existingTimeout = timeoutRefs.current.get(operation)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    dispatch({
      type: 'START_LOADING',
      operation,
      message,
    })

    // Auto-finish loading after 30 seconds to prevent stuck states
    const timeout = setTimeout(() => {
      console.warn(`Auto-finishing loading state for operation: ${operation}`)
      dispatch({ type: 'FINISH_LOADING', operation })
      timeoutRefs.current.delete(operation)
    }, 30000)

    timeoutRefs.current.set(operation, timeout)
  }, [])

  // Finish loading for a specific operation
  const finishLoading = useCallback((operation: AuthOperation) => {
    // Clear timeout
    const timeout = timeoutRefs.current.get(operation)
    if (timeout) {
      clearTimeout(timeout)
      timeoutRefs.current.delete(operation)
    }

    dispatch({ type: 'FINISH_LOADING', operation })
  }, [])

  // Update progress for a specific operation
  const updateProgress = useCallback((operation: AuthOperation, progress: number, message?: string) => {
    dispatch({
      type: 'UPDATE_PROGRESS',
      operation,
      progress: Math.max(0, Math.min(100, progress)), // Clamp between 0-100
      message,
    })
  }, [])

  // Set message for a specific operation
  const setMessage = useCallback((operation: AuthOperation, message: string) => {
    dispatch({ type: 'SET_MESSAGE', operation, message })
  }, [])

  // Clear all loading states
  const clearAll = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current.clear()
    
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  // Check if a specific operation is loading
  const isOperationLoading = useCallback((operation: AuthOperation): boolean => {
    return state.states[operation]?.isLoading || false
  }, [state.states])

  // Get the loading state for a specific operation
  const getOperationState = useCallback((operation: AuthOperation): LoadingState | undefined => {
    return state.states[operation]
  }, [state.states])

  // Get the current message for a specific operation
  const getCurrentMessage = useCallback((operation: AuthOperation): string | undefined => {
    return state.states[operation]?.message
  }, [state.states])

  // Get a global loading message (from the first active operation)
  const getGlobalLoadingMessage = useCallback((): string | undefined => {
    const firstActiveOperation = state.operationQueue[0]
    return firstActiveOperation ? state.states[firstActiveOperation]?.message : undefined
  }, [state.states, state.operationQueue])

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    loadingStates: state,
    startLoading,
    finishLoading,
    updateProgress,
    setMessage,
    clearAll,
    isOperationLoading,
    getOperationState,
    getCurrentMessage,
    getGlobalLoadingMessage,
  }), [
    state,
    startLoading,
    finishLoading,
    updateProgress,
    setMessage,
    clearAll,
    isOperationLoading,
    getOperationState,
    getCurrentMessage,
    getGlobalLoadingMessage,
  ])
}

/**
 * Higher-order hook for managing loading state of async operations
 * Automatically handles start/finish loading states
 */
export function useAsyncOperation(operation: AuthOperation) {
  const { startLoading, finishLoading, updateProgress, isOperationLoading } = useAuthLoading()

  const executeWithLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      message?: string
      onProgress?: (progress: number) => void
      onSuccess?: (result: T) => void
      onError?: (error: any) => void
    }
  ): Promise<T> => {
    startLoading(operation, options?.message)
    
    try {
      const result = await asyncFn()
      if (options?.onSuccess) {
        options.onSuccess(result)
      }
      return result
    } catch (error) {
      if (options?.onError) {
        options.onError(error)
      }
      throw error
    } finally {
      finishLoading(operation)
    }
  }, [operation, startLoading, finishLoading])

  return {
    isLoading: isOperationLoading(operation),
    executeWithLoading,
    startLoading: () => startLoading(operation),
    finishLoading: () => finishLoading(operation),
    updateProgress: (progress: number, message?: string) => updateProgress(operation, progress, message),
  }
}

/**
 * Hook for managing multiple operation loading states
 * Useful for components that need to track multiple operations
 */
export function useMultipleOperations(operations: AuthOperation[]) {
  const { isOperationLoading, getOperationState } = useAuthLoading()

  return useMemo(() => ({
    isAnyLoading: operations.some(op => isOperationLoading(op)),
    loadingStates: operations.reduce((acc, op) => {
      acc[op] = getOperationState(op) || { isLoading: false }
      return acc
    }, {} as Record<AuthOperation, LoadingState>),
    loadingOperations: operations.filter(op => isOperationLoading(op)),
  }), [operations, isOperationLoading, getOperationState])
}