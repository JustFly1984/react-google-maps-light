import * as React from 'react'

import invariant from 'invariant'

export interface DistanceMatrixServiceProps {
  // required for default functionality
  options: google.maps.DistanceMatrixRequest

  // required for default functionality
  callback: (
    // required
    /** The response to a DistanceMatrixService request, consisting of the formatted origin and destination addresses, and a sequence of DistanceMatrixResponseRows, one for each corresponding origin address. */
    response: google.maps.DistanceMatrixResponse,
    // required
    /** The top-level status about the request in general returned by the DistanceMatrixService upon completion of a distance matrix request. Specify these by value, or by using the constant's name. For example, 'OK' or google.maps.DistanceMatrixStatus.OK. */
    status: google.maps.DistanceMatrixStatus
  ) => void
  /** This callback is called when the distanceMatrixService instance has loaded. It is called with the distanceMatrixService instance. */
  onLoad?: (distanceMatrixService: google.maps.DistanceMatrixService) => void
  /** This callback is called when the component unmounts. It is called with the distanceMatrixService instance. */
  onUnmount?: (distanceMatrixService: google.maps.DistanceMatrixService) => void
}

function DistanceMatrixService(props: DistanceMatrixServiceProps): JSX.Element {
  const { options, callback, onLoad, onUnmount } = props

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.DistanceMatrixService | null>(null)

  React.useEffect(
    function effect() {
      invariant(
        !!options,
        'DistanceMatrixService expected options object as parameter, but go %s',
        options
      )

      if (instance === null) {
        setInstance(new google.maps.DistanceMatrixService())
      }

      if (instance !== null) {
        if (onLoad) {
          onLoad(instance)
        }
      }

      return function cleanup() {
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
        instance.getDistanceMatrix(options, callback)
      }
    },
    [instance, options, callback]
  )

  return <></>
}

export default React.memo(DistanceMatrixService)
