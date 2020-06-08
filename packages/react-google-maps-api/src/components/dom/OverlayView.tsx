import * as React from 'react'
import * as ReactDOM from 'react-dom'

import invariant from 'invariant'

import MapContext from '../../map-context'
import ContentMountHandler from './count-mount-handler'
import { usePrevious } from '../../utils/use-previous'

import { getOffsetOverride, getLayoutStyles } from './dom-helper'

function convertToLatLngString(
  latLngLike?: google.maps.LatLng | google.maps.LatLngLiteral | null
): string {
  if (!latLngLike) {
    return ''
  }

  const latLng =
    latLngLike instanceof google.maps.LatLng
      ? latLngLike
      : new google.maps.LatLng(latLngLike.lat, latLngLike.lng)

  return latLng + ''
}

function convertToLatLngBoundsString(
  latLngBoundsLike?:
    | google.maps.LatLngBounds
    | google.maps.LatLngBoundsLiteral
    | null
): string {
  if (!latLngBoundsLike) {
    return ''
  }

  const latLngBounds =
    latLngBoundsLike instanceof google.maps.LatLngBounds
      ? latLngBoundsLike
      : new google.maps.LatLngBounds(
          new google.maps.LatLng(latLngBoundsLike.south, latLngBoundsLike.east),
          new google.maps.LatLng(latLngBoundsLike.north, latLngBoundsLike.west)
        )

  return latLngBounds + ''
}

export interface OverlayViewProps {
  // required
  children: React.ReactChild
  mapPaneName: keyof google.maps.MapPanes
  getPixelPositionOffset?: (
    offsetWidth: number,
    offsetHeight: number
  ) => { x: number; y: number }
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral
  position?: google.maps.LatLng | google.maps.LatLngLiteral
  onLoad?: (overlayView: google.maps.OverlayView) => void
  onUnmount?: (overlayView: google.maps.OverlayView) => void
}

// const FLOAT_PANE = `floatPane`
// const MAP_PANE = `mapPane`
// const MARKER_LAYER = `markerLayer`
// const OVERLAY_LAYER = `overlayLayer`
// const OVERLAY_MOUSE_TARGET = `overlayMouseTarget`

function OverlayView(props: OverlayViewProps): JSX.Element {
  const {
    children,
    mapPaneName,
    bounds,
    getPixelPositionOffset,
    onLoad,
    onUnmount,
    position,
  } = props
  const prevProps: OverlayViewProps = usePrevious<OverlayViewProps>(props)

  const map = React.useContext(MapContext)
  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.OverlayView | null>(null)
  const [
    containerStyle,
    setContainerStyle,
  ] = React.useState<React.CSSProperties | null>(null)
  const mapPanelRef = React.useRef<Element | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const onPositionElement = React.useCallback(
    function callback(): void {
      if (instance !== null) {
        const mapCanvasProjection = instance.getProjection()

        const offset = {
          x: 0,
          y: 0,
          ...(containerRef.current
            ? getOffsetOverride(containerRef.current, getPixelPositionOffset)
            : {}),
        }

        const layoutStyles: React.CSSProperties | null = getLayoutStyles(
          mapCanvasProjection,
          offset,
          bounds,
          position
        )

        setContainerStyle(layoutStyles)
      }
    },
    [bounds, getPixelPositionOffset, instance, position]
  )

  const draw = React.useCallback(
    function callback(): void {
      onPositionElement()
    },
    [onPositionElement]
  )

  const onRemove = React.useCallback(function callback(): void {
    mapPanelRef.current = null
  }, [])

  const handleOverlayViewCallback = React.useCallback(
    function callback(): void {
      if (instance !== null && onLoad) {
        onLoad(instance)
      }

      onPositionElement()
    },
    [instance, onLoad, onPositionElement]
  )

  const onAdd = React.useCallback(
    function callback(): void {
      invariant(
        !!mapPaneName,
        `OverlayView requires mapPaneName but got %s`,
        mapPaneName
      )

      // https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapPanes
      if (instance !== null) {
        const mapPanes: google.maps.MapPanes = instance.getPanes()

        if (!mapPanes) {
          return
        }

        mapPanelRef.current = mapPanes[mapPaneName]
      }
    },
    [instance, mapPaneName]
  )

  React.useEffect(
    function effect(): () => void {
      const instance = new google.maps.OverlayView()

      // You must implement three methods: onAdd(), draw(), and onRemove().
      instance.onAdd = onAdd
      instance.draw = draw
      instance.onRemove = onRemove

      // the onAdd() method and setMap(null) in order to trigger the onRemove() method.
      // You must call setMap() with a valid Map object to trigger the call to
      instance.setMap(map)

      setInstance(instance)

      return function cleanup(): void {
        if (instance !== null) {
          if (onUnmount) {
            onUnmount(instance)
          }

          instance.setMap(null)
        }
      }
    },
    [draw, map, onAdd, onRemove, onUnmount]
  )

  React.useEffect(
    function effect(): () => void {
      const prevPositionString = convertToLatLngString(prevProps.position)
      const positionString = convertToLatLngString(position)
      const prevBoundsString = convertToLatLngBoundsString(prevProps.bounds)
      const boundsString = convertToLatLngBoundsString(bounds)

      let timeout = 0
      if (
        prevPositionString !== positionString ||
        prevBoundsString !== boundsString
      ) {
        timeout = window.setTimeout(() => {
          instance !== null && instance.draw()
        }, 0)
      }

      return function cleanup(): void {
        window.clearTimeout(timeout)
      }
    },
    [bounds, instance, position, prevProps.bounds, prevProps.position]
  )

  const containerStyleMemo: React.CSSProperties = React.useMemo(
    function memo() {
      return { ...containerStyle, position: 'absolute' }
    },
    [containerStyle]
  )

  return mapPanelRef.current !== null ? (
    ReactDOM.createPortal(
      <div ref={containerRef} style={containerStyleMemo}>
        <ContentMountHandler onLoad={handleOverlayViewCallback}>
          {React.Children.only(children)}
        </ContentMountHandler>
      </div>,
      mapPanelRef.current
    )
  ) : (
    <></>
  )
}

export default React.memo(OverlayView)
