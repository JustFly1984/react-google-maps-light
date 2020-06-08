import * as React from 'react'

import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import MapContext from '../../map-context'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onClick: 'click',
  onDefaultViewportChanged: 'defaultviewport_changed',
  onStatusChanged: 'status_changed',
}

const updaterMap = {
  options(
    instance: google.maps.KmlLayer,
    options: google.maps.KmlLayerOptions
  ): void {
    instance.setOptions(options)
  },
  url(instance: google.maps.KmlLayer, url: string): void {
    instance.setUrl(url)
  },
  zIndex(instance: google.maps.KmlLayer, zIndex: number): void {
    instance.setZIndex(zIndex)
  },
}

export interface KmlLayerProps {
  options?: google.maps.KmlLayerOptions
  /** The URL of the KML document to display. */
  url?: string
  /** The z-index of the layer. */
  zIndex?: number
  /** This event is fired when a feature in the layer is clicked. */
  onClick?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the KML layers default viewport has changed. */
  onDefaultViewportChanged?: () => void
  /** This event is fired when the KML layer has finished loading. At this point it is safe to read the status property to determine if the layer loaded successfully. */
  onStatusChanged?: () => void
  /** This callback is called when the kmlLayer instance has loaded. It is called with the kmlLayer instance. */
  onLoad: (kmlLayer: google.maps.KmlLayer) => void
  /** This callback is called when the component unmounts. It is called with the kmlLayer instance. */
  onUnmount: (kmlLayer: google.maps.KmlLayer) => void
}

function KmlLayer(props: KmlLayerProps): JSX.Element {
  const { options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: KmlLayerProps = usePrevious<KmlLayerProps>(props)

  const [instance, setInstance] = React.useState<google.maps.KmlLayer | null>(
    null
  )

  React.useEffect(
    function effect() {
      if (map !== null) {
        if (instance === null) {
          setInstance(
            new google.maps.KmlLayer({
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

export default React.memo(KmlLayer)
