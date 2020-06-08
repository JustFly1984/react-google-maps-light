/* globals google */
export interface ClusterIconInfo {
  text: string
  index: number
  title: string
}

export type MarkerExtended = google.maps.Marker & {
  isAdded?: boolean
}

export type TCalculator = (
  markers: MarkerExtended[],
  num: number
) => ClusterIconInfo

export interface ClustererOptions {
  gridSize?: number
  maxZoom?: number
  zoomOnClick?: boolean
  averageCenter?: boolean
  minimumClusterSize?: number
  ignoreHidden?: boolean
  title?: string
  calculator?: TCalculator
  clusterClass?: string
  styles?: ClusterIconStyle[]
  enableRetinaIcons?: boolean
  batchSize?: number
  batchSizeIE?: number
  imagePath?: string
  imageExtension?: string
  imageSizes?: number[]
}

export interface ClusterIconStyle {
  url: string
  height: number
  width: number
  anchorText?: number[]
  anchorIcon?: number[]
  textColor?: string
  textSize?: number
  textDecoration?: string
  fontWeight?: string
  fontStyle?: string
  fontFamily?: string
  backgroundPosition?: string
}
