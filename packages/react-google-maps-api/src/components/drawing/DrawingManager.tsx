/* globals google */
import * as React from 'react'

import invariant from 'invariant'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onCircleComplete: 'circlecomplete',
  onMarkerComplete: 'markercomplete',
  onOverlayComplete: 'overlaycomplete',
  onPolygonComplete: 'polygoncomplete',
  onPolylineComplete: 'polylinecomplete',
  onRectangleComplete: 'rectanglecomplete',
}

const updaterMap = {
  drawingMode(
    instance: google.maps.drawing.DrawingManager,
    drawingMode: google.maps.drawing.OverlayType | null
  ): void {
    instance.setDrawingMode(drawingMode)
  },
  options(
    instance: google.maps.drawing.DrawingManager,
    options: google.maps.drawing.DrawingManagerOptions
  ): void {
    instance.setOptions(options)
  },
}

export interface DrawingManagerProps {
  options?: google.maps.drawing.DrawingManagerOptions
  /** Changes the DrawingManager's drawing mode, which defines the type of overlay to be added on the map. Accepted values are 'marker', 'polygon', 'polyline', 'rectangle', 'circle', or null. A drawing mode of null means that the user can interact with the map as normal, and clicks do not draw anything. */
  drawingMode?: google.maps.drawing.OverlayType | null
  /** This event is fired when the user has finished drawing a circle. */
  onCircleComplete?: (circle: google.maps.Circle) => void
  /** This event is fired when the user has finished drawing a marker. */
  onMarkerComplete?: (marker: google.maps.Marker) => void
  /** This event is fired when the user has finished drawing an overlay of any type. */
  onOverlayComplete?: (e: google.maps.drawing.OverlayCompleteEvent) => void
  /** This event is fired when the user has finished drawing a polygon. */
  onPolygonComplete?: (polygon: google.maps.Polygon) => void
  /** This event is fired when the user has finished drawing a polyline. */
  onPolylineComplete?: (polyline: google.maps.Polyline) => void
  /** This event is fired when the user has finished drawing a rectangle. */
  onRectangleComplete?: (rectangle: google.maps.Rectangle) => void
  /** This callback is called when the drawingManager instance has loaded. It is called with the drawingManager instance. */
  onLoad?: (drawingManager: google.maps.drawing.DrawingManager) => void
  /** This callback is called when the component unmounts. It is called with the drawingManager instance. */
  onUnmount?: (drawingManager: google.maps.drawing.DrawingManager) => void
}

function DrawingManager(props: DrawingManagerProps): JSX.Element {
  const { options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: DrawingManagerProps = usePrevious<DrawingManagerProps>(props)

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.drawing.DrawingManager | null>(null)

  React.useEffect(
    function effect() {
      invariant(
        !!google.maps.drawing,
        `Did you include prop libraries={['drawing']} in the URL? %s`,
        google.maps.drawing
      )

      if (map !== null) {
        if (instance === null) {
          setInstance(
            new google.maps.drawing.DrawingManager({
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

export default React.memo(DrawingManager)
