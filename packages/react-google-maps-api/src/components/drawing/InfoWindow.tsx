/* global google */
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import invariant from 'invariant'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onCloseClick: 'closeclick',
  onContentChanged: 'content_changed',
  onDomReady: 'domready',
  onPositionChanged: 'position_changed',
  onZindexChanged: 'zindex_changed',
}

const updaterMap = {
  options(
    instance: google.maps.InfoWindow,
    options: google.maps.InfoWindowOptions
  ): void {
    instance.setOptions(options)
  },
  position(
    instance: google.maps.InfoWindow,
    position: google.maps.LatLng | google.maps.LatLngLiteral
  ): void {
    instance.setPosition(position)
  },
  zIndex(instance: google.maps.InfoWindow, zIndex: number): void {
    instance.setZIndex(zIndex)
  },
}

export interface InfoWindowProps {
  children: React.ReactNode
  /** Can be any MVCObject that exposes a LatLng position property and optionally a Point anchorPoint property for calculating the pixelOffset. The anchorPoint is the offset from the anchor's position to the tip of the InfoWindow. */
  anchor?: google.maps.MVCObject
  options?: google.maps.InfoWindowOptions
  /** The LatLng at which to display this InfoWindow. If the InfoWindow is opened with an anchor, the anchor's position will be used instead. */
  position?: google.maps.LatLng | google.maps.LatLngLiteral
  /** All InfoWindows are displayed on the map in order of their zIndex, with higher values displaying in front of InfoWindows with lower values. By default, InfoWindows are displayed according to their latitude, with InfoWindows of lower latitudes appearing in front of InfoWindows at higher latitudes. InfoWindows are always displayed in front of markers. */
  zIndex?: number
  /** This event is fired when the close button was clicked. */
  onCloseClick?: () => void
  /** This event is fired when the <div> containing the InfoWindow's content is attached to the DOM. You may wish to monitor this event if you are building out your info window content dynamically. */
  onDomReady?: () => void
  /** This event is fired when the content property changes. */
  onContentChanged?: () => void
  /** This event is fired when the position property changes. */
  onPositionChanged?: () => void
  /** This event is fired when the InfoWindow's zIndex changes. */
  onZindexChanged?: () => void
  /** This callback is called when the infoWindow instance has loaded. It is called with the infoWindow instance. */
  onLoad?: (infoWindow: google.maps.InfoWindow) => void
  /** This callback is called when the component unmounts. It is called with the infoWindow instance. */
  onUnmount?: (infoWindow: google.maps.InfoWindow) => void
}

function InfoWindow(props: InfoWindowProps): JSX.Element {
  const { children, anchor, options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: InfoWindowProps = usePrevious<InfoWindowProps>(props)
  const [
    containerElement,
    setContainerElement,
  ] = React.useState<HTMLElement | null>(null)

  const [instance, setInstance] = React.useState<google.maps.InfoWindow | null>(
    null
  )

  React.useEffect(
    function effect() {
      if (map !== null) {
        if (instance === null) {
          setInstance(
            new google.maps.InfoWindow({
              ...(options || {}),
            })
          )

          setContainerElement(document.createElement('div'))
        }

        if (instance !== null && containerElement !== null) {
          instance.setContent(containerElement)

          if (anchor) {
            instance.open(map, anchor)
          } else if (instance.getPosition()) {
            instance.open(map)
          } else {
            invariant(
              false,
              `You must provide either an anchor (typically render it inside a <Marker>) or a position props for <InfoWindow>.`
            )
          }

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

          instance.close()
        }
      }
    },
    [instance, anchor, containerElement, map, options, onLoad, onUnmount]
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

  return containerElement ? (
    <>
      {ReactDOM.createPortal(React.Children.only(children), containerElement)}
    </>
  ) : (
    <></>
  )
}

export default React.memo(InfoWindow)
