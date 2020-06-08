import * as React from 'react'

import MapContext from '../../map-context'

export interface TransitLayerProps {
  /** This callback is called when the transitLayer instance has loaded. It is called with the transitLayer instance. */
  onLoad?: (transitLayer: google.maps.TransitLayer) => void
  /** This callback is called when the component unmounts. It is called with the transitLayer instance. */
  onUnmount?: (transitLayer: google.maps.TransitLayer) => void
}

function TransitLayer(props: TransitLayerProps): JSX.Element {
  const { onLoad, onUnmount } = props
  const map = React.useContext(MapContext)

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.TransitLayer | null>(null)

  React.useEffect(
    function effect(): () => void {
      const newInstance: google.maps.TransitLayer = new google.maps.TransitLayer()
      setInstance(newInstance)

      newInstance.setMap(map)

      if (onLoad) {
        onLoad(newInstance)
      }

      return function cleanup(): void {
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

export default React.memo(TransitLayer)
