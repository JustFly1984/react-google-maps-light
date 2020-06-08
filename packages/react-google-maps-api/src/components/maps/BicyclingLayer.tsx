import * as React from 'react'

import MapContext from '../../map-context'

export interface BicyclingLayerProps {
  /** This callback is called when the bicyclingLayer instance has loaded. It is called with the bicyclingLayer instance. */
  onLoad?: (bicyclingLayer: google.maps.BicyclingLayer) => void
  /** This callback is called when the component unmounts. It is called with the bicyclingLayer instance. */
  onUnmount?: (bicyclingLayer: google.maps.BicyclingLayer) => void
}

function BicyclingLayer({
  onLoad,
  onUnmount,
}: BicyclingLayerProps): JSX.Element {
  const map = React.useContext(MapContext)

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.BicyclingLayer | null>(null)

  React.useEffect(
    function effect() {
      if (map !== null) {
        if (instance === null) {
          setInstance(new google.maps.BicyclingLayer())
        }

        if (instance !== null) {
          instance.setMap(map)

          if (onLoad) {
            onLoad(instance)
          }
        }
      }

      return function cleanup() {
        if (instance !== null) {
          if (onUnmount) {
            onUnmount(instance)
          }

          instance.setMap(null)
        }
      }
    },
    [instance, map, onLoad, onUnmount]
  )

  return <></>
}

export default React.memo(BicyclingLayer)
