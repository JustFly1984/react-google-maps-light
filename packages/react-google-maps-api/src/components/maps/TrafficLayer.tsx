import * as React from 'react'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {}

const updaterMap = {
  options(
    instance: google.maps.TrafficLayer,
    options: google.maps.TrafficLayerOptions
  ): void {
    instance.setOptions(options)
  },
}

export interface TrafficLayerProps {
  options?: google.maps.TrafficLayerOptions
  /** This callback is called when the trafficLayer instance has loaded. It is called with the trafficLayer instance. */
  onLoad?: (trafficLayer: google.maps.TrafficLayer) => void
  /** This callback is called when the component unmounts. It is called with the trafficLayer instance. */
  onUnmount?: (trafficLayer: google.maps.TrafficLayer) => void
}

function TrafficLayer(props: TrafficLayerProps): JSX.Element {
  const { options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: TrafficLayerProps = usePrevious<TrafficLayerProps>(props)

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.TrafficLayer | null>(null)

  React.useEffect(
    function effect() {
      if (map !== null) {
        if (instance === null) {
          setInstance(
            new google.maps.TrafficLayer({
              ...(options || {}),
              map,
            })
          )
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
    [instance, map, options, onLoad, onUnmount]
  )

  React.useEffect(
    function effect(): () => void {
      const registeredEvents: google.maps.MapsEventListener[] = applyUpdatersToPropsAndRegisterEvents(
        {
          updaterMap,
          eventMap,
          prevProps,
          nextProps: props,
          instance,
        }
      )

      return function cleanup(): void {
        unregisterEvents(registeredEvents)
      }
    },
    [props, instance, prevProps]
  )

  return <></>
}

export default React.memo(TrafficLayer)
