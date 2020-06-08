import * as React from 'react'

import invariant from 'invariant'

import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import MapContext from '../../map-context'
import { noop } from '../../utils/noop'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onDblClick: 'dblclick',
  onClick: 'click',
}

const updaterMap = {
  opacity(instance: google.maps.GroundOverlay, opacity: number): void {
    instance.setOpacity(opacity)
  },
}

export interface GroundOverlayProps {
  options?: google.maps.GroundOverlayOptions
  /** The opacity of the overlay, expressed as a number between 0 and 1. Optional. Defaults to 1. */
  opacity?: number
  /** This event is fired when the DOM dblclick event is fired on the GroundOverlay. */
  onDblClick?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the DOM click event is fired on the GroundOverlay. */
  onClick?: (e: google.maps.MouseEvent) => void
  /** The url of the projected image */
  url: string
  /** The bounds that the image will be scaled to fit */
  bounds: google.maps.LatLngBounds
  /** This callback is called when the groundOverlay instance has loaded. It is called with the groundOverlay instance. */
  onLoad?: (groundOverlay: google.maps.GroundOverlay) => void
  /** This callback is called when the component unmounts. It is called with the groundOverlay instance. */
  onUnmount?: (groundOverlay: google.maps.GroundOverlay) => void
}

function GroundOverlay(props: GroundOverlayProps): JSX.Element {
  const {
    options,
    // opacity,
    // onDblClick,
    // onClick,
    url,
    bounds,
    onLoad = noop,
    onUnmount,
  } = props
  const map = React.useContext(MapContext)
  const prevProps: GroundOverlayProps = usePrevious<GroundOverlayProps>(props)

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.GroundOverlay | null>(null)

  React.useEffect(
    function effect() {
      invariant(
        !!url || !!bounds,
        `For GroundOverlay, url and bounds are passed in to constructor and are immutable after instantiated. This is the behavior of Google Maps JavaScript API v3 ( See https://developers.google.com/maps/documentation/javascript/reference#GroundOverlay) Hence, use the corresponding two props provided by \`react-google-maps-api\`, url and bounds. In some cases, you'll need the GroundOverlay component to reflect the changes of url and bounds. You can leverage the React's key property to remount the component. Typically, just \`key={url}\` would serve your need. See https://github.com/tomchentw/react-google-maps/issues/655`
      )

      if (map !== null) {
        if (instance === null) {
          setInstance(
            new google.maps.GroundOverlay(url, bounds, {
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
    [instance, map, bounds, url, options, onLoad, onUnmount]
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

export default React.memo(GroundOverlay)
