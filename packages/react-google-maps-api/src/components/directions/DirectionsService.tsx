import * as React from 'react'
import invariant from 'invariant'

export interface DirectionsServiceProps {
  // required for default functionality
  options: google.maps.DirectionsRequest

  // required for default functionality
  callback: (
    // required
    /** The directions response retrieved from the directions server. You can render these using a DirectionsRenderer or parse this object and render it yourself. You must display the warnings and copyrights as noted in the Google Maps Platform Terms of Service. Note that though this result is "JSON-like," it is not strictly JSON, as it indirectly includes LatLng objects */
    result: google.maps.DirectionsResult,
    // required
    /** The status returned by the DirectionsService on the completion of a call to route(). Specify these by value, or by using the constant's name. For example, 'OK' or google.maps.DirectionsStatus.OK */
    status: google.maps.DirectionsStatus
  ) => void
  /** This callback is called when the directionsService instance has loaded. It is called with the directionsService instance. */
  onLoad?: (directionsService: google.maps.DirectionsService) => void
  /** This callback is called when the component unmounts. It is called with the directionsService instance. */
  onUnmount?: (directionsService: google.maps.DirectionsService) => void
}

function DirectionsService(props: DirectionsServiceProps): JSX.Element {
  const { options, callback, onLoad, onUnmount } = props
  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.DirectionsService | null>(null)

  React.useEffect(
    function effect() {
      invariant(
        !!options,
        'DirectionsService expected options object as parameter, but got %s',
        options
      )

      if (instance === null) {
        setInstance(new google.maps.DirectionsService())
      }

      if (instance !== null) {
        if (onLoad) {
          onLoad(instance)
        }
      }

      return function cleanup(): void {
        if (instance !== null) {
          if (onUnmount) {
            onUnmount(instance)
          }
        }
      }
    },
    [instance, options, onLoad, onUnmount]
  )

  React.useEffect(
    function effect() {
      if (instance !== null) {
        instance.route(options, callback)
      }
    },
    [instance, options, callback]
  )

  return <></>
}

export default React.memo(DirectionsService)
