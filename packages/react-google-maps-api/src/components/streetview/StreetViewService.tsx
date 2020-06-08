import * as React from 'react'

export interface StreetViewServiceProps {
  /** This callback is called when the streetViewService instance has loaded. It is called with the streetViewService instance. */
  onLoad?: (streetViewService: google.maps.StreetViewService | null) => void
  /** This callback is called when the component unmounts. It is called with the streetViewService instance. */
  onUnmount?: (streetViewService: google.maps.StreetViewService | null) => void
}

function StreetViewService(props: StreetViewServiceProps): JSX.Element {
  const { onLoad, onUnmount } = props

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.StreetViewService | null>(null)

  React.useEffect(
    function effect(): () => void {
      const streetViewService = new google.maps.StreetViewService()

      setInstance(streetViewService)

      if (instance !== null && onLoad) {
        onLoad(instance)
      }

      return function callback(): void {
        if (instance !== null) {
          if (onUnmount) {
            onUnmount(instance)
          }
        }
      }
    },
    [instance, onLoad, onUnmount]
  )

  return <></>
}

export default React.memo(StreetViewService)
