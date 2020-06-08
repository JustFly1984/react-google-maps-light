import * as React from 'react'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onDirectionsChanged: 'directions_changed',
}

const updaterMap = {
  directions(
    instance: google.maps.DirectionsRenderer,
    directions: google.maps.DirectionsResult
  ): void {
    instance.setDirections(directions)
  },
  map(instance: google.maps.DirectionsRenderer, map: google.maps.Map): void {
    instance.setMap(map)
  },
  options(
    instance: google.maps.DirectionsRenderer,
    options: google.maps.DirectionsRendererOptions
  ): void {
    instance.setOptions(options)
  },
  panel(instance: google.maps.DirectionsRenderer, panel: Element): void {
    instance.setPanel(panel)
  },
  routeIndex(
    instance: google.maps.DirectionsRenderer,
    routeIndex: number
  ): void {
    instance.setRouteIndex(routeIndex)
  },
}

export interface DirectionsRendererProps {
  options?: google.maps.DirectionsRendererOptions
  /** The directions to display on the map and/or in a <div> panel, retrieved as a DirectionsResult object from DirectionsService. */
  directions?: google.maps.DirectionsResult
  /** The <div> in which to display the directions steps. */
  panel?: Element
  /** The index of the route within the DirectionsResult object. The default value is 0. */
  routeIndex?: number
  /** This event is fired when the rendered directions change, either when a new DirectionsResult is set or when the user finishes dragging a change to the directions path. */
  onDirectionsChanged?: () => void
  /** This callback is called when the directionsRenderer instance has loaded. It is called with the directionsRenderer instance. */
  onLoad?: (directionsRenderer: google.maps.DirectionsRenderer) => void
  /** This callback is called when the component unmounts. It is called with the directionsRenderer instance. */
  onUnmount?: (directionsRenderer: google.maps.DirectionsRenderer) => void
}

function DirectionsRenderer(props: DirectionsRendererProps): JSX.Element {
  const { options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: DirectionsRendererProps = usePrevious<
    DirectionsRendererProps
  >(props)

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.DirectionsRenderer | null>(null)

  React.useEffect(
    function effect() {
      if (map !== null) {
        if (instance === null) {
          setInstance(new google.maps.DirectionsRenderer(options))
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

export default React.memo(DirectionsRenderer)
