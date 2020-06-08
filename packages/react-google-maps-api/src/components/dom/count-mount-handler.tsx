import * as React from 'react'

interface ContentMountHandlerProps {
  children: React.ReactNode
  onLoad?: () => void
}

function ContentMountHandler({
  children,
  onLoad,
}: ContentMountHandlerProps): JSX.Element {
  React.useEffect(
    function effect(): void {
      if (onLoad) {
        onLoad()
      }
    },
    [onLoad]
  )

  return <>{children}</>
}

export default React.memo(ContentMountHandler)
