import * as React from 'react'

export function usePrevious<T>(props: T): T {
  const ref = React.useRef<T>(props)

  React.useEffect(
    function effect(): void {
      ref.current = props
    },
    [props]
  )

  return ref.current
}
