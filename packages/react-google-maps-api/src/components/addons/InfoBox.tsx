/* global google */
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  InfoBox as GoogleMapsInfoBox,
  InfoBoxOptions as GoogleMapsInfoBoxOptions,
} from '@react-google-maps/infobox'
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
    instance: GoogleMapsInfoBox,
    options: GoogleMapsInfoBoxOptions
  ): void {
    instance.setOptions(options)
  },
  position(
    instance: GoogleMapsInfoBox,
    position: google.maps.LatLng | google.maps.LatLngLiteral
  ): void {
    if (position instanceof google.maps.LatLng) {
      instance.setPosition(position)
    } else {
      instance.setPosition(new google.maps.LatLng(position.lat, position.lng))
    }
  },
  visible(instance: GoogleMapsInfoBox, visible: boolean): void {
    instance.setVisible(visible)
  },
  zIndex(instance: GoogleMapsInfoBox, zIndex: number): void {
    instance.setZIndex(zIndex)
  },
}

type InfoBoxOptions = Omit<GoogleMapsInfoBoxOptions, 'position'> & {
  position?: google.maps.LatLng | google.maps.LatLngLiteral
}

export interface InfoBoxProps {
  children: React.ReactNode
  /** Can be any MVCObject that exposes a LatLng position property and optionally a Point anchorPoint property for calculating the pixelOffset. The anchorPoint is the offset from the anchor's position to the tip of the InfoBox. */
  anchor?: google.maps.MVCObject
  options?: InfoBoxOptions
  /** The LatLng at which to display this InfoBox. If the InfoBox is opened with an anchor, the anchor's position will be used instead. */
  position?: google.maps.LatLng | google.maps.LatLngLiteral
  /** All InfoBoxes are displayed on the map in order of their zIndex, with higher values displaying in front of InfoBoxes with lower values. By default, InfoBoxes are displayed according to their latitude, with InfoBoxes of lower latitudes appearing in front of InfoBoxes at higher latitudes. InfoBoxes are always displayed in front of markers. */
  zIndex?: number
  /** This event is fired when the close button was clicked. */
  onCloseClick?: () => void
  /** This event is fired when the <div> containing the InfoBox's content is attached to the DOM. You may wish to monitor this event if you are building out your info window content dynamically. */
  onDomReady?: () => void
  /** This event is fired when the content property changes. */
  onContentChanged?: () => void
  /** This event is fired when the position property changes. */
  onPositionChanged?: () => void
  /** This event is fired when the InfoBox's zIndex changes. */
  onZindexChanged?: () => void
  /** This callback is called when the infoBox instance has loaded. It is called with the infoBox instance. */
  onLoad?: (infoBox: GoogleMapsInfoBox) => void
  /** This callback is called when the component unmounts. It is called with the infoBox instance. */
  onUnmount?: (infoBox: GoogleMapsInfoBox) => void
}

function InfoBoxComponent(props: InfoBoxProps): JSX.Element {
  const { children, options, anchor, onLoad, onUnmount } = props
  const { position, ...infoBoxOptions }: InfoBoxOptions = options || {}

  const map = React.useContext(MapContext)
  const prevProps: InfoBoxProps = usePrevious<InfoBoxProps>(props)
  const containerElementRef = React.useRef<HTMLDivElement | null>(null)

  const [instance, setInstance] = React.useState<GoogleMapsInfoBox | null>(null)

  React.useEffect(
    function effect() {
      if (map !== null) {
        if (instance === null) {
          let positionLatLng: google.maps.LatLng | undefined

          if (position && !(position instanceof google.maps.LatLng)) {
            positionLatLng = new google.maps.LatLng(position.lat, position.lng)
          }

          containerElementRef.current = document.createElement('div')

          const infoBox = new GoogleMapsInfoBox({
            ...infoBoxOptions,
            ...(positionLatLng ? { position: positionLatLng } : {}),
          })

          setInstance(infoBox)
        }

        if (instance !== null && containerElementRef.current !== null) {
          instance.setContent(containerElementRef.current)

          if (anchor) {
            instance.open(map, anchor)
          } else if (instance.getPosition()) {
            instance.open(map)
          } else {
            invariant(
              false,
              'You must provide either an anchor or a position prop for <InfoBox>.'
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
    [
      instance,
      map,
      options,
      onLoad,
      onUnmount,
      anchor,
      containerElementRef,
      infoBoxOptions,
      position,
    ]
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

  if (containerElementRef.current === null) {
    return <></>
  } else {
    return (
      <>
        {ReactDOM.createPortal(
          React.Children.only(children),
          containerElementRef.current
        )}
      </>
    )
  }
}

export default React.memo(InfoBoxComponent)
