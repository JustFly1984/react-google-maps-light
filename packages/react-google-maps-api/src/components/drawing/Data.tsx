import * as React from 'react'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onAddFeature: 'addfeature',
  onClick: 'click',
  onDblClick: 'dblclick',
  onMouseDown: 'mousedown',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
  onRemoveFeature: 'removefeature',
  onRemoveProperty: 'removeproperty',
  onRightClick: 'rightclick',
  onSetGeometry: 'setgeometry',
  onSetProperty: 'setproperty',
}

const updaterMap = {
  add(
    instance: google.maps.Data,
    features: google.maps.Data.Feature | google.maps.Data.FeatureOptions
  ): void {
    instance.add(features)
  },
  addgeojson(
    instance: google.maps.Data,
    geojson: Record<string, unknown>,
    options?: google.maps.Data.GeoJsonOptions
  ): void {
    instance.addGeoJson(geojson, options)
  },
  contains(
    instance: google.maps.Data,
    feature: google.maps.Data.Feature
  ): void {
    instance.contains(feature)
  },
  foreach(
    instance: google.maps.Data,
    callback: (feature: google.maps.Data.Feature) => void
  ): void {
    instance.forEach(callback)
  },
  loadgeojson(
    instance: google.maps.Data,
    url: string,
    options: google.maps.Data.GeoJsonOptions,
    callback: (features: google.maps.Data.Feature[]) => void
  ): void {
    instance.loadGeoJson(url, options, callback)
  },
  overridestyle(
    instance: google.maps.Data,
    feature: google.maps.Data.Feature,
    style: google.maps.Data.StyleOptions
  ): void {
    instance.overrideStyle(feature, style)
  },
  remove(instance: google.maps.Data, feature: google.maps.Data.Feature): void {
    instance.remove(feature)
  },
  revertstyle(
    instance: google.maps.Data,
    feature: google.maps.Data.Feature
  ): void {
    instance.revertStyle(feature)
  },
  controlposition(
    instance: google.maps.Data,
    controlPosition: google.maps.ControlPosition
  ): void {
    instance.setControlPosition(controlPosition)
  },
  controls(
    instance: google.maps.Data,
    controls: google.maps.DrawingMode[] | null
  ): void {
    instance.setControls(controls)
  },
  drawingmode(instance: google.maps.Data, mode: google.maps.DrawingMode): void {
    instance.setDrawingMode(mode)
  },
  map(instance: google.maps.Data, map: google.maps.Map): void {
    instance.setMap(map)
  },
  style(
    instance: google.maps.Data,
    style: google.maps.Data.StylingFunction | google.maps.Data.StyleOptions
  ): void {
    instance.setStyle(style)
  },
  togeojson(
    instance: google.maps.Data,
    // wait till @types/googlemapsapi support typescript 3.9.5
    // eslint-disable-next-line @typescript-eslint/ban-types
    callback: (feature: object) => void
  ): void {
    instance.toGeoJson(callback)
  },
}

export interface DataProps {
  options?: google.maps.Data.DataOptions
  /**  This event is fired when a feature is added to the collection. */
  onAddFeature?: (e: google.maps.Data.AddFeatureEvent) => void
  /**  This event is fired for a click on the geometry. */
  onClick?: (e: google.maps.Data.MouseEvent) => void
  /**  This event is fired for a double click on the geometry. */
  onDblClick?: (e: google.maps.Data.MouseEvent) => void
  /**  This event is fired for a mousedown on the geometry. */
  onMouseDown?: (e: google.maps.Data.MouseEvent) => void
  /**  This event is fired when the mouse leaves the area of the geometry. */
  onMouseOut?: (e: google.maps.Data.MouseEvent) => void
  /**  This event is fired when the mouse enters the area of the geometry. */
  onMouseOver?: (e: google.maps.Data.MouseEvent) => void
  /**  This event is fired for a mouseup on the geometry. */
  onMouseUp?: (e: google.maps.Data.MouseEvent) => void
  /**  This event is fired when a feature is removed from the collection. */
  onRemoveFeature?: (e: google.maps.Data.RemoveFeatureEvent) => void
  /**  This event is fired when a feature's property is removed. */
  onRemoveProperty?: (e: google.maps.Data.RemovePropertyEvent) => void
  /**  This event is fired for a rightclick on the geometry. */
  onRightClick?: (e: google.maps.Data.MouseEvent) => void
  /**  This event is fired when a feature's geometry is set. */
  onSetGeometry?: (e: google.maps.Data.SetGeometryEvent) => void
  /**  This event is fired when a feature's property is set. */
  onSetProperty?: (e: google.maps.Data.SetPropertyEvent) => void
  /**  This callback is called when the data instance has loaded. It is called with the data instance. */
  onLoad?: (data: google.maps.Data) => void
  /**  This callback is called when the component unmounts. It is called with the data instance.  */
  onUnmount?: (data: google.maps.Data) => void
}

function Data(props: DataProps): JSX.Element {
  const { options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: DataProps = usePrevious<DataProps>(props)

  const [instance, setInstance] = React.useState<google.maps.Data | null>(null)

  React.useEffect(
    function effect() {
      if (map !== null) {
        if (instance === null) {
          setInstance(
            new google.maps.Data({
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

export default React.memo(Data)
