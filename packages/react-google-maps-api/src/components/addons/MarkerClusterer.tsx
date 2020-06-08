import * as React from 'react'
import {
  Clusterer,
  ClusterIconStyle,
  Cluster,
  ClustererOptions,
  TCalculator,
} from '@react-google-maps/marker-clusterer'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onClick: 'click',
  onClusteringBegin: 'clusteringbegin',
  onClusteringEnd: 'clusteringend',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
}

const updaterMap = {
  averageCenter(instance: Clusterer, averageCenter: boolean): void {
    instance.setAverageCenter(averageCenter)
  },

  batchSizeIE(instance: Clusterer, batchSizeIE: number): void {
    instance.setBatchSizeIE(batchSizeIE)
  },

  calculator(instance: Clusterer, calculator: TCalculator): void {
    instance.setCalculator(calculator)
  },

  clusterClass(instance: Clusterer, clusterClass: string): void {
    instance.setClusterClass(clusterClass)
  },

  enableRetinaIcons(instance: Clusterer, enableRetinaIcons: boolean): void {
    instance.setEnableRetinaIcons(enableRetinaIcons)
  },

  gridSize(instance: Clusterer, gridSize: number): void {
    instance.setGridSize(gridSize)
  },

  ignoreHidden(instance: Clusterer, ignoreHidden: boolean): void {
    instance.setIgnoreHidden(ignoreHidden)
  },

  imageExtension(instance: Clusterer, imageExtension: string): void {
    instance.setImageExtension(imageExtension)
  },

  imagePath(instance: Clusterer, imagePath: string): void {
    instance.setImagePath(imagePath)
  },

  imageSizes(instance: Clusterer, imageSizes: number[]): void {
    instance.setImageSizes(imageSizes)
  },

  maxZoom(instance: Clusterer, maxZoom: number): void {
    instance.setMaxZoom(maxZoom)
  },

  minimumClusterSize(instance: Clusterer, minimumClusterSize: number): void {
    instance.setMinimumClusterSize(minimumClusterSize)
  },

  styles(instance: Clusterer, styles: ClusterIconStyle[]): void {
    instance.setStyles(styles)
  },

  title(instance: Clusterer, title: string): void {
    instance.setTitle(title)
  },

  zoomOnClick(instance: Clusterer, zoomOnClick: boolean): void {
    instance.setZoomOnClick(zoomOnClick)
  },
}

export interface ClustererProps {
  // required
  children: (markerClusterer: Clusterer) => React.ReactNode

  options?: ClustererOptions // TODO: it could be undefined
  /** Whether the position of a cluster marker should be the average position of all markers in the cluster. If set to false, the cluster marker is positioned at the location of the first marker added to the cluster. The default value is false. */
  averageCenter?: boolean
  /** When Internet Explorer is being used, markers are processed in several batches with a small delay inserted between each batch in an attempt to avoid Javascript timeout errors. Set this property to the number of markers to be processed in a single batch; select as high a number as you can without causing a timeout error in the browser. This number might need to be as low as 100 if 15,000 markers are being managed, for example. The default value is MarkerClusterer.BATCH_SIZE_IE. */
  batchSizeIE?: number
  /** The function used to determine the text to be displayed on a cluster marker and the index indicating which style to use for the cluster marker. The input parameters for the function are (1) the array of markers represented by a cluster marker and (2) the number of cluster icon styles. It returns a ClusterIconInfo object. The default calculator returns a text property which is the number of markers in the cluster and an index property which is one higher than the lowest integer such that 10^i exceeds the number of markers in the cluster, or the size of the styles array, whichever is less. The styles array element used has an index of index minus 1. For example, the default calculator returns a text value of "125" and an index of 3 for a cluster icon representing 125 markers so the element used in the styles array is 2. A calculator may also return a title property that contains the text of the tooltip to be used for the cluster marker. If title is not defined, the tooltip is set to the value of the title property for the MarkerClusterer. The default value is MarkerClusterer.CALCULATOR. */
  calculator?: TCalculator
  /** The name of the CSS class defining general styles for the cluster markers. Use this class to define CSS styles that are not set up by the code that processes the styles array. The default value is "cluster". */
  clusterClass?: string
  /** Whether to allow the use of cluster icons that have sizes that are some multiple (typically double) of their actual display size. Icons such as these look better when viewed on high-resolution monitors such as Apple's Retina displays. Note: if this property is true, sprites cannot be used as cluster icons. The default value is false. */
  enableRetinaIcons?: boolean
  /** The grid size of a cluster in pixels. The grid is a square. The default value is 60. */
  gridSize?: number
  /** Whether to ignore hidden markers in clusters. You may want to set this to true to ensure that hidden markers are not included in the marker count that appears on a cluster marker (this count is the value of the text property of the result returned by the default calculator). If set to true and you change the visibility of a marker being clustered, be sure to also call MarkerClusterer.repaint(). The default value is false. */
  ignoreHidden?: boolean
  /** The extension name for the cluster icon image files (e.g., "png" or "jpg"). The default value is MarkerClusterer.IMAGE_EXTENSION. */
  imageExtension?: string
  /** The full URL of the root name of the group of image files to use for cluster icons. The complete file name is of the form imagePath.imageExtension where n is the image file number (1, 2, etc.). The default value is MarkerClusterer.IMAGE_PATH. */
  imagePath?: string
  /** An array of numbers containing the widths of the group of imagePath.imageExtension image files. (The images are assumed to be square.) The default value is MarkerClusterer.IMAGE_SIZES. */
  imageSizes?: number[]
  /** The maximum zoom level at which clustering is enabled or null if clustering is to be enabled at all zoom levels. The default value is null. */
  maxZoom?: number
  /** The minimum number of markers needed in a cluster before the markers are hidden and a cluster marker appears. The default value is 2. */
  minimumClusterSize?: number
  /** An array of ClusterIconStyle elements defining the styles of the cluster markers to be used. The element to be used to style a given cluster marker is determined by the function defined by the calculator property. The default is an array of ClusterIconStyle elements whose properties are derived from the values for imagePath, imageExtension, and imageSizes. */
  styles?: ClusterIconStyle[]
  /** The tooltip to display when the mouse moves over a cluster marker. (Alternatively, you can use a custom calculator function to specify a different tooltip for each cluster marker.) The default value is "". */
  title?: string
  /** Whether to zoom the map when a cluster marker is clicked. You may want to set this to false if you have installed a handler for the click event and it deals with zooming on its own. The default value is true. */
  zoomOnClick?: boolean
  /** This event is fired when a cluster marker is clicked. */
  onClick?: (cluster: Cluster) => void
  /** This event is fired when the MarkerClusterer begins clustering markers. */
  onClusteringBegin?: (markerClusterer: Clusterer) => void
  /** This event is fired when the MarkerClusterer stops clustering markers. */
  onClusteringEnd?: (markerClusterer: Clusterer) => void
  /** 	This event is fired when the mouse moves over a cluster marker. */
  onMouseOver?: (cluster: Cluster) => void
  /** This event is fired when the mouse moves out of a cluster marker. */
  onMouseOut?: (cluster: Cluster) => void
  /** This callback is called when the markerClusterer instance has loaded. It is called with the markerClusterer instance. */
  onLoad?: (markerClusterer: Clusterer) => void
  /** This callback is called when the component unmounts. It is called with the markerClusterer instance. */
  onUnmount?: (markerClusterer: Clusterer) => void
}

function ClustererComponent(props: ClustererProps): JSX.Element {
  const { children, options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: ClustererProps = usePrevious<ClustererProps>(props)

  const [instance, setInstance] = React.useState<Clusterer | null>(null)

  React.useEffect(
    function effect() {
      if (map !== null) {
        if (instance === null) {
          setInstance(new Clusterer(map, [], options))
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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

  return instance !== null ? <>{children(instance)}</> : <></>
}

export default React.memo(ClustererComponent)
