import * as React from 'react'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onCloseClick: 'closeclick',
  onPanoChanged: 'pano_changed',
  onPositionChanged: 'position_changed',
  onPovChanged: 'pov_changed',
  onResize: 'resize',
  onStatusChanged: 'status_changed',
  onVisibleChanged: 'visible_changed',
  onZoomChanged: 'zoom_changed',
}

const updaterMap = {
  register(
    instance: google.maps.StreetViewPanorama,
    provider: (input: string) => google.maps.StreetViewPanoramaData,
    options: google.maps.PanoProviderOptions
  ): void {
    instance.registerPanoProvider(provider, options)
  },
  links(
    instance: google.maps.StreetViewPanorama,
    links: google.maps.StreetViewLink[]
  ): void {
    instance.setLinks(links)
  },
  motionTracking(
    instance: google.maps.StreetViewPanorama,
    motionTracking: boolean
  ): void {
    instance.setMotionTracking(motionTracking)
  },
  options(
    instance: google.maps.StreetViewPanorama,
    options: google.maps.StreetViewPanoramaOptions
  ): void {
    instance.setOptions(options)
  },
  pano(instance: google.maps.StreetViewPanorama, pano: string): void {
    instance.setPano(pano)
  },
  position(
    instance: google.maps.StreetViewPanorama,
    position: google.maps.LatLng | google.maps.LatLngLiteral
  ): void {
    instance.setPosition(position)
  },
  pov(
    instance: google.maps.StreetViewPanorama,
    pov: google.maps.StreetViewPov
  ): void {
    instance.setPov(pov)
  },
  visible(instance: google.maps.StreetViewPanorama, visible: boolean): void {
    instance.setVisible(visible)
  },
  zoom(instance: google.maps.StreetViewPanorama, zoom: number): void {
    instance.setZoom(zoom)
  },
}

export interface StreetViewPanoramaProps {
  options?: google.maps.StreetViewPanoramaOptions
  /** This event is fired when the close button is clicked. */
  onCloseclick?: (event: google.maps.MouseEvent) => void
  /** This event is fired when the panorama's pano id changes. The pano may change as the user navigates through the panorama or the position is manually set. Note that not all position changes trigger a pano_changed. */
  onPanoChanged?: () => void
  /** This event is fired when the panorama's position changes. The position changes as the user navigates through the panorama or the position is set manually. */
  onPositionChanged?: () => void
  /** This event is fired when the panorama's point-of-view changes. The point of view changes as the pitch, zoom, or heading changes. */
  onPovChanged?: () => void
  /** Developers should trigger this event on the panorama when its div changes size: google.maps.event.trigger(panorama, 'resize'). */
  onResize?: () => void
  /** This event is fired after every panorama lookup by id or location, via setPosition() or setPano(). */
  onStatusChanged?: () => void
  /** This event is fired when the panorama's visibility changes. The visibility is changed when the Pegman is dragged onto the map, the close button is clicked, or setVisible() is called. */
  onVisibleChanged?: () => void
  /** This event is fired when the panorama's zoom level changes. */
  onZoomChange?: () => void
  /** This callback is called when the streetViewPanorama instance has loaded. It is called with the streetViewPanorama instance. */
  onLoad?: (streetViewPanorama: google.maps.StreetViewPanorama) => void
  /** This callback is called when the component unmounts. It is called with the streetViewPanorama instance. */
  onUnmount?: (streetViewPanorama: google.maps.StreetViewPanorama) => void
}

function StreetViewPanorama(props: StreetViewPanoramaProps): JSX.Element {
  const { options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: StreetViewPanoramaProps = usePrevious<
    StreetViewPanoramaProps
  >(props)

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.StreetViewPanorama | null>(null)

  React.useEffect(
    function effect() {
      if (map !== null) {
        if (instance === null) {
          setInstance(map.getStreetView())
        }

        if (instance !== null) {
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

          instance.setVisible(false)
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

export default StreetViewPanorama
