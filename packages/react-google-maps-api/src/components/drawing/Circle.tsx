import * as React from 'react'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onCenterChanged: 'center_changed',
  onClick: 'click',
  onDblClick: 'dblclick',
  onDrag: 'drag',
  onDragEnd: 'dragend',
  onDragStart: 'dragstart',
  onMouseDown: 'mousedown',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
  onRadiusChanged: 'radius_changed',
  onRightClick: 'rightclick',
}

const updaterMap = {
  center(instance: google.maps.Circle, center: google.maps.LatLng): void {
    instance.setCenter(center)
  },
  draggable(instance: google.maps.Circle, draggable: boolean): void {
    instance.setDraggable(draggable)
  },
  editable(instance: google.maps.Circle, editable: boolean): void {
    instance.setEditable(editable)
  },
  map(instance: google.maps.Circle, map: google.maps.Map): void {
    instance.setMap(map)
  },
  options(
    instance: google.maps.Circle,
    options: google.maps.CircleOptions
  ): void {
    instance.setOptions(options)
  },
  radius(instance: google.maps.Circle, radius: number): void {
    instance.setRadius(radius)
  },
  visible(instance: google.maps.Circle, visible: boolean): void {
    instance.setVisible(visible)
  },
}

export interface CircleProps {
  options?: google.maps.CircleOptions

  // required
  /** sets the center of the circle */
  center: google.maps.LatLng | google.maps.LatLngLiteral

  // required
  /** Sets the radius of this circle (in meters) */
  radius: number
  /** If set to true, the user can drag this circle over the map */
  draggable?: boolean
  /** If set to true, the user can edit this circle by dragging the control points shown at the center and around the circumference of the circle. */
  editable?: boolean
  /** Hides this circle if set to false. */
  visible?: boolean
  /** This event is fired when the DOM dblclick event is fired on the circle. */
  onDblClick?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the user stops dragging the circle. */
  onDragEnd?: (e: google.maps.MouseEvent) => void
  /**  This event is fired when the user starts dragging the circle. */
  onDragStart?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the DOM mousedown event is fired on the circle. */
  onMouseDown?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the DOM mousemove event is fired on the circle. */
  onMouseMove?: (e: google.maps.MouseEvent) => void
  /** This event is fired on circle mouseout. */
  onMouseOut?: (e: google.maps.MouseEvent) => void
  /** This event is fired on circle mouseover. */
  onMouseOver?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the DOM mouseup event is fired on the circle. */
  onMouseUp?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the circle is right-clicked on. */
  onRightClick?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the circle's center is changed. */
  onCenterChanged?: () => void
  /** This event is fired when the DOM click event is fired on the circle. */
  onClick?: (e: google.maps.MouseEvent) => void
  /** This event is repeatedly fired while the user drags the circle. */
  onDrag?: (e: google.maps.MouseEvent) => void
  /** This event is fired when the circle's radius is changed. */
  onRadiusChanged?: () => void
  /** This callback is called when the circle instance has loaded. It is called with the circle instance. */
  onLoad?: (circle: google.maps.Circle) => void
  /** This callback is called when the component unmounts. It is called with the circle instance. */
  onUnmount?: (circle: google.maps.Circle) => void
}

function Circle(props: CircleProps): JSX.Element {
  const { options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: CircleProps = usePrevious<CircleProps>(props)

  const [instance, setInstance] = React.useState<google.maps.Circle | null>(
    null
  )

  React.useEffect(
    function effect() {
      if (map !== null) {
        if (instance === null) {
          setInstance(
            new google.maps.Circle({
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

export default React.memo(Circle)
