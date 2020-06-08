import * as React from 'react'

import MapContext from './map-context'

import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from './utils/helper'
import { usePrevious } from './utils/use-previous'

const eventMap = {
  onDblClick: 'dblclick',
  onDragEnd: 'dragend',
  onDragStart: 'dragstart',
  onMapTypeIdChanged: 'maptypeid_changed',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseDown: 'mousedown',
  onMouseUp: 'mouseup',
  onRightClick: 'rightclick',
  onTilesLoaded: 'tilesloaded',
  onBoundsChanged: 'bounds_changed',
  onCenterChanged: 'center_changed',
  onClick: 'click',
  onDrag: 'drag',
  onHeadingChanged: 'heading_changed',
  onIdle: 'idle',
  onProjectionChanged: 'projection_changed',
  onResize: 'resize',
  onTiltChanged: 'tilt_changed',
  onZoomChanged: 'zoom_changed',
}

const updaterMap = {
  extraMapTypes(map: google.maps.Map, extra: google.maps.MapType[]): void {
    extra.forEach(function forEachExtra(it, i) {
      map.mapTypes.set(String(i), it)
    })
  },
  center(
    map: google.maps.Map,
    center: google.maps.LatLng | google.maps.LatLngLiteral
  ): void {
    map.setCenter(center)
  },
  clickableIcons(map: google.maps.Map, clickable: boolean): void {
    map.setClickableIcons(clickable)
  },
  heading(map: google.maps.Map, heading: number): void {
    map.setHeading(heading)
  },
  mapTypeId(map: google.maps.Map, mapTypeId: string): void {
    map.setMapTypeId(mapTypeId)
  },
  options(map: google.maps.Map, options: google.maps.MapOptions): void {
    map.setOptions(options)
  },
  streetView(
    map: google.maps.Map,
    streetView: google.maps.StreetViewPanorama
  ): void {
    map.setStreetView(streetView)
  },
  tilt(map: google.maps.Map, tilt: number): void {
    map.setTilt(tilt)
  },
  zoom(map: google.maps.Map, zoom: number): void {
    map.setZoom(zoom)
  },
}

export interface GoogleMapProps {
  children: React.ReactNode
  id?: string
  mapContainerStyle?: React.CSSProperties
  mapContainerClassName?: string
  options?: google.maps.MapOptions
  /** Additional map types to overlay. Overlay map types will display on top of the base map they are attached to, in the order in which they appear in the overlayMapTypes array (overlays with higher index values are displayed in front of overlays with lower index values). */
  extraMapTypes?: google.maps.MapType[]
  /** The initial Map center. */
  center?: google.maps.LatLng | google.maps.LatLngLiteral
  /** When false, map icons are not clickable. A map icon represents a point of interest, also known as a POI. By default map icons are clickable. */
  clickableIcons?: boolean
  /** The heading for aerial imagery in degrees measured clockwise from cardinal direction North. Headings are snapped to the nearest available angle for which imagery is available. */
  heading?: number
  /** The initial Map mapTypeId. Defaults to ROADMAP. */
  mapTypeId?: string
  /** A StreetViewPanorama to display when the Street View pegman is dropped on the map. If no panorama is specified, a default StreetViewPanorama will be displayed in the map's div when the pegman is dropped. */
  streetView?: google.maps.StreetViewPanorama
  /** Controls the automatic switching behavior for the angle of incidence of the map. The only allowed values are 0 and 45. The value 0 causes the map to always use a 0° overhead view regardless of the zoom level and viewport. The value 45 causes the tilt angle to automatically switch to 45 whenever 45° imagery is available for the current zoom level and viewport, and switch back to 0 whenever 45° imagery is not available (this is the default behavior). 45° imagery is only available for satellite and hybrid map types, within some locations, and at some zoom levels. Note: getTilt returns the current tilt angle, not the value specified by this option. Because getTilt and this option refer to different things, do not bind() the tilt property; doing so may yield unpredictable effects. */
  tilt?: number
  /** The initial Map zoom level. Required. Valid values: Integers between zero, and up to the supported maximum zoom level. */
  zoom?: number
  /** This event is fired when the user clicks on the map. An ApiMouseEvent with properties for the clicked location is returned unless a place icon was clicked, in which case an IconMouseEvent with a placeId is returned. IconMouseEvent and ApiMouseEvent are identical, except that IconMouseEvent has the placeId field. The event can always be treated as an ApiMouseEvent when the placeId is not important. The click event is not fired if a Marker or InfoWindow was clicked. */
  onClick?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the user double-clicks on the map. Note that the click event will also fire, right before this one. */
  onDblClick?: (e: google.maps.MouseEvent) => void
  /** This event is repeatedly fired while the user drags the map. */
  onDrag?: () => void
  /** This event is fired when the user stops dragging the map. */
  onDragEnd?: () => void
  /** This event is fired when the user starts dragging the map. */
  onDragStart?: () => void
  /** This event is fired when the mapTypeId property changes. */
  onMapTypeIdChanged?: () => void
  /** This event is fired whenever the user's mouse moves over the map container. */
  onMouseMove?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the user's mouse exits the map container. */
  onMouseOut?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the user's mouse enters the map container. */
  onMouseOver?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the DOM contextmenu event is fired on the map container. */
  onRightClick?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the visible tiles have finished loading. */
  onTilesLoaded?: () => void
  /** This event is fired when the viewport bounds have changed. */
  onBoundsChanged?: () => void
  /** This event is fired when the map center property changes. */
  onCenterChanged?: () => void
  /** This event is fired when the map heading property changes. */
  onHeadingChanged?: () => void
  /** This event is fired when the map becomes idle after panning or zooming. */
  onIdle?: () => void
  /** This event is fired when the projection has changed. */
  onProjectionChanged?: () => void
  /** This event is fired when the map size has changed. */
  onResize?: () => void
  /** This event is fired when the map tilt property changes. */
  onTiltChanged?: () => void
  /** This event is fired when the map zoom property changes. */
  onZoomChanged?: () => void
  /** This callback is called when the map instance has loaded. It is called with the map instance. */
  onLoad?: (map: google.maps.Map) => void | Promise<void>
  /** This callback is called when the component unmounts. It is called with the map instance. */
  onUnmount?: (map: google.maps.Map) => void | Promise<void>
}

function GoogleMap(props: GoogleMapProps): JSX.Element {
  const {
    children,
    options,
    id,
    mapContainerStyle,
    mapContainerClassName,
    onLoad,
    onUnmount,
  } = props
  const [instance, setInstance] = React.useState<google.maps.Map | null>(null)
  const mapRef = React.createRef<HTMLDivElement>()
  const prevProps: GoogleMapProps = usePrevious<GoogleMapProps>(props)

  React.useEffect(
    function effect() {
      if (instance === null && mapRef.current !== null) {
        setInstance(new google.maps.Map(mapRef.current, options))
      }

      if (instance !== null) {
        if (onLoad) {
          onLoad(instance)
        }
      }

      return function cleanup(): void {
        if (instance !== null) {
          if (onUnmount) {
            onUnmount(instance)
          }
        }
      }
    },
    [instance, options, onLoad, onUnmount, mapRef]
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

  return (
    <div
      id={id}
      ref={mapRef}
      style={mapContainerStyle}
      className={mapContainerClassName}
    >
      <MapContext.Provider value={instance}>
        {instance !== null ? children : <></>}
      </MapContext.Provider>
    </div>
  )
}

export default React.memo(GoogleMap)
