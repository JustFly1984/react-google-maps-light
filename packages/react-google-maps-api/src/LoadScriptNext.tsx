import * as React from 'react'

import { DefaultLoadingElement } from './LoadScript'
import { useLoadScript, UseLoadScriptOptions } from './useLoadScript'

export interface LoadScriptNextProps extends UseLoadScriptOptions {
  loadingElement?: React.ReactElement
  onLoad?: () => void
  onError?: (error: Error) => void
  onUnmount?: () => void
  children: React.ReactElement
}

const defaultLoadingElement = <DefaultLoadingElement />

function LoadScriptNext({
  loadingElement,
  onLoad,
  onError,
  onUnmount,
  children,
  ...hookOptions
}: LoadScriptNextProps): JSX.Element {
  const { isLoaded, loadError } = useLoadScript(hookOptions)

  React.useEffect(
    function effect() {
      if (isLoaded && typeof onLoad === 'function') {
        onLoad()
      }
    },
    [isLoaded, onLoad]
  )

  React.useEffect(
    function effect() {
      if (loadError && typeof onError === 'function') {
        onError(loadError)
      }
    },
    [loadError, onError]
  )

  React.useEffect(
    function effect() {
      return () => {
        if (onUnmount) {
          onUnmount()
        }
      }
    },
    [onUnmount]
  )

  return isLoaded ? children : loadingElement || defaultLoadingElement
}

export default React.memo(LoadScriptNext)
