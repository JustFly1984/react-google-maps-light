import * as React from 'react'
import invariant from 'invariant'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onPlacesChanged: 'places_changed',
}

const updaterMap = {
  bounds(
    instance: google.maps.places.SearchBox,
    bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral
  ): void {
    instance.setBounds(bounds)
  },
}

export interface StandaloneSearchBoxProps {
  children: React.ReactNode
  /** The area towards which to bias query predictions. Predictions are biased towards, but not restricted to, queries targeting these bounds. */
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral
  options?: google.maps.places.SearchBoxOptions
  /** This event is fired when the user selects a query, getPlaces should be used to get new places. */
  onPlacesChanged?: () => void
  /** This callback is called when the searchBox instance has loaded. It is called with the searchBox instance. */
  onLoad?: (searchBox: google.maps.places.SearchBox) => void
  /** This callback is called when the component unmounts. It is called with the searchBox instance. */
  onUnmount?: (searchBox: google.maps.places.SearchBox) => void
}

function StandaloneSearchBox(props: StandaloneSearchBoxProps): JSX.Element {
  const { children, options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: StandaloneSearchBoxProps = usePrevious<
    StandaloneSearchBoxProps
  >(props)
  const containerElementRef = React.useRef<HTMLDivElement | null>(null)

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.places.SearchBox | null>(null)

  React.useEffect(
    function effect() {
      invariant(
        !!google.maps.places,
        'You need to provide libraries={["places"]} prop to <LoadScript /> component %s',
        google.maps.places
      )

      if (map !== null) {
        if (containerElementRef.current !== null) {
          const input = containerElementRef.current.querySelector('input')

          if (input !== null) {
            const searchBox = new google.maps.places.SearchBox(input, options)

            setInstance(searchBox)

            if (searchBox !== null && onLoad) {
              onLoad(searchBox)
            }
          }
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

  return <div ref={containerElementRef}>{React.Children.only(children)}</div>
}

export default React.memo(StandaloneSearchBox)
