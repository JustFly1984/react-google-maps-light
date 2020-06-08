import * as React from 'react'
import invariant from 'invariant'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {}

const updaterMap = {
  data(
    instance: google.maps.visualization.HeatmapLayer,
    data:
      | google.maps.MVCArray<
          google.maps.LatLng | google.maps.visualization.WeightedLocation
        >
      | google.maps.LatLng[]
      | google.maps.visualization.WeightedLocation[]
  ): void {
    instance.setData(data)
  },
  map(
    instance: google.maps.visualization.HeatmapLayer,
    map: google.maps.Map
  ): void {
    instance.setMap(map)
  },
  options(
    instance: google.maps.visualization.HeatmapLayer,
    options: google.maps.visualization.HeatmapLayerOptions
  ): void {
    instance.setOptions(options)
  },
}

export interface HeatmapLayerProps {
  // required
  /** The data points to display. Required. */
  data:
    | google.maps.MVCArray<
        google.maps.LatLng | google.maps.visualization.WeightedLocation
      >
    | google.maps.LatLng[]
    | google.maps.visualization.WeightedLocation[]
  options?: google.maps.visualization.HeatmapLayerOptions
  /** This callback is called when the heatmapLayer instance has loaded. It is called with the heatmapLayer instance. */
  onLoad?: (heatmapLayer: google.maps.visualization.HeatmapLayer) => void
  /** This callback is called when the component unmounts. It is called with the heatmapLayer instance. */
  onUnmount?: (heatmapLayer: google.maps.visualization.HeatmapLayer) => void
}

function HeatmapLayer(props: HeatmapLayerProps): JSX.Element {
  const { data, options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: HeatmapLayerProps = usePrevious<HeatmapLayerProps>(props)
  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.visualization.HeatmapLayer | null>(null)

  React.useEffect(
    function effect() {
      invariant(
        !!google.maps.visualization,
        'Did you include prop libraries={["visualization"]} to <LoadScript />? %s',
        google.maps.visualization
      )

      invariant(!!data, 'data property is required in HeatmapLayer %s', data)

      if (map !== null) {
        if (instance === null) {
          setInstance(
            new google.maps.visualization.HeatmapLayer({
              ...(options || {}),
              data,
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
    [instance, data, map, options, onLoad, onUnmount]
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

export default React.memo(HeatmapLayer)
