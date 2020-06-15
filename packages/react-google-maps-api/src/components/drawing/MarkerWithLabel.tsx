import React, {
  FC,
  CSSProperties,
  useEffect,
  memo,
  useCallback,
  useState,
} from 'react'
import ReactDOM from 'react-dom'
import Marker, { MarkerProps, updaterMap } from './Marker'
import markerWithLabelFactory from 'markerwithlabel'

export interface MarkerWithLabelProps extends MarkerProps {
  labelAnchor?: google.maps.Point
  labelClass?: string
  labelStyle?: CSSProperties
  labelVisible?: boolean
}

const markerWithLabelUpdaterMap = {
  labelAnchor(instance: google.maps.Marker, labelAnchor: google.maps.Point) {
    instance.set(`labelAnchor`, labelAnchor)
  },
  labelClass(instance: google.maps.Marker, labelClass: string) {
    instance.set(`labelClass`, labelClass)
  },
  labelStyle(instance: google.maps.Marker, labelStyle: CSSProperties) {
    instance.set(`labelStyle`, labelStyle)
  },
  labelVisible(instance: google.maps.Marker, labelVisible: boolean) {
    instance.set(`labelVisible`, labelVisible)
  },
  ...updaterMap,
}

const MarkerWithLabel: FC<MarkerWithLabelProps> = ({
  labelAnchor,
  labelClass,
  labelStyle,
  labelVisible,
  ...rest
}) => {
  const [
    containerElement,
    setContainerElement,
  ] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    setContainerElement(document.createElement('div'))
  }, [setContainerElement])

  const createMarker = useCallback(
    (markerOptions: google.maps.MarkerOptions) => {
      const MarkerWithLabel = markerWithLabelFactory(google.maps)
      const marker = new MarkerWithLabel({
        ...markerOptions,
        labelAnchor,
        labelClass,
        labelStyle,
        labelVisible,
      })
      marker.set('labelContent', containerElement)
      return marker
    },
    [containerElement, labelAnchor, labelClass, labelStyle, labelVisible]
  )

  return (
    <>
      {containerElement &&
        ReactDOM.createPortal(
          <Marker
            markerFactory={createMarker}
            defaultUpdaterMap={markerWithLabelUpdaterMap}
            {...rest}
          />,
          containerElement
        )}
    </>
  )
}

export default memo(MarkerWithLabel)
