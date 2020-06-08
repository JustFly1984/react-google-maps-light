/* global google */
import { Cluster } from './Cluster'

import {
  MarkerExtended,
  ClustererOptions,
  ClusterIconStyle,
  TCalculator,
  ClusterIconInfo,
} from './types'

const CALCULATOR = function CALCULATOR(
  markers: MarkerExtended[],
  numStyles: number
): ClusterIconInfo {
  let index = 0

  const title = ''

  const count = markers.length.toString()

  let dv: string | number = count

  while (dv !== 0) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dv = parseInt(dv, 10) / 10

    index++
  }

  index = Math.min(index, numStyles)

  return {
    text: count,
    index: index,
    title: title,
  }
}

const BATCH_SIZE = 2000

const BATCH_SIZE_IE = 500

const IMAGE_PATH =
  'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'

const IMAGE_EXTENSION = 'png'

const IMAGE_SIZES = [53, 56, 66, 78, 90]

const CLUSTERER_CLASS = 'cluster'

export class Clusterer {
  markers: MarkerExtended[]
  clusters: Cluster[]
  listeners: google.maps.MapsEventListener[]
  activeMap: google.maps.Map | google.maps.StreetViewPanorama | null
  ready: boolean
  gridSize: number
  minClusterSize: number
  maxZoom: number | null
  styles: ClusterIconStyle[]
  title: string
  zoomOnClick: boolean
  averageCenter: boolean
  ignoreHidden: boolean
  enableRetinaIcons: boolean
  imagePath: string
  imageExtension: string
  imageSizes: number[]
  calculator: TCalculator
  batchSize: number
  batchSizeIE: number
  clusterClass: string
  timerRefStatic: number | null

  constructor(
    map: google.maps.Map,
    optMarkers: MarkerExtended[] = [],
    optOptions: ClustererOptions = {}
  ) {
    this.extend(Clusterer, google.maps.OverlayView)

    this.markers = []
    this.clusters = []
    this.listeners = []
    this.activeMap = null
    this.ready = false
    this.gridSize = optOptions.gridSize || 60
    this.minClusterSize = optOptions.minimumClusterSize || 2
    this.maxZoom = optOptions.maxZoom || null
    this.styles = optOptions.styles || []

    this.title = optOptions.title || ''

    this.zoomOnClick = true

    if (optOptions.zoomOnClick !== undefined) {
      this.zoomOnClick = optOptions.zoomOnClick
    }

    this.averageCenter = false

    if (optOptions.averageCenter !== undefined) {
      this.averageCenter = optOptions.averageCenter
    }

    this.ignoreHidden = false

    if (optOptions.ignoreHidden !== undefined) {
      this.ignoreHidden = optOptions.ignoreHidden
    }

    this.enableRetinaIcons = false

    if (optOptions.enableRetinaIcons !== undefined) {
      this.enableRetinaIcons = optOptions.enableRetinaIcons
    }
    this.imagePath = optOptions.imagePath || IMAGE_PATH

    this.imageExtension = optOptions.imageExtension || IMAGE_EXTENSION

    this.imageSizes = optOptions.imageSizes || IMAGE_SIZES

    this.calculator = optOptions.calculator || CALCULATOR

    this.batchSize = optOptions.batchSize || BATCH_SIZE

    this.batchSizeIE = optOptions.batchSizeIE || BATCH_SIZE_IE

    this.clusterClass = optOptions.clusterClass || CLUSTERER_CLASS

    if (navigator.userAgent.toLowerCase().indexOf('msie') !== -1) {
      // Try to avoid IE timeout when processing a huge number of markers:
      this.batchSize = this.batchSizeIE
    }

    this.timerRefStatic = null

    this.setupStyles()

    this.addMarkers(optMarkers, true)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.setMap(map) // Note: this causes onAdd to be called
  }

  onAdd(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.activeMap = this.getMap()

    this.ready = true

    this.repaint()

    // Add the map event listeners
    this.listeners = [
      google.maps.event.addListener(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.getMap(),
        'zoom_changed',
        () => {
          this.resetViewport(false)
          // Workaround for this Google bug: when map is at level 0 and "-" of
          // zoom slider is clicked, a "zoom_changed" event is fired even though
          // the map doesn't zoom out any further. In this situation, no "idle"
          // event is triggered so the cluster markers that have been removed
          // do not get redrawn. Same goes for a zoom in at maxZoom.
          if (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.getMap().getZoom() === (this.get('minZoom') || 0) ||
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.getMap().getZoom() === this.get('maxZoom')
          ) {
            google.maps.event.trigger(this, 'idle')
          }
        }
      ),
      google.maps.event.addListener(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.getMap(),
        'idle',
        () => {
          this.redraw()
        }
      ),
    ]
  }

  onRemove(): void {
    // Put all the managed markers back on the map:
    for (let i = 0; i < this.markers.length; i++) {
      if (this.markers[i].getMap() !== this.activeMap) {
        this.markers[i].setMap(this.activeMap)
      }
    }

    // Remove all clusters:
    for (let i = 0; i < this.clusters.length; i++) {
      this.clusters[i].remove()
    }

    this.clusters = []

    // Remove map event listeners:
    for (let i = 0; i < this.listeners.length; i++) {
      google.maps.event.removeListener(this.listeners[i])
    }

    this.listeners = []

    this.activeMap = null

    this.ready = false
  }

  draw(): void {
    return
  }

  setupStyles(): void {
    if (this.styles.length > 0) {
      return
    }

    for (let i = 0; i < this.imageSizes.length; i++) {
      this.styles.push({
        url: this.imagePath + (i + 1) + '.' + this.imageExtension,
        height: this.imageSizes[i],
        width: this.imageSizes[i],
      })
    }
  }

  fitMapToMarkers(): void {
    const markers = this.getMarkers()

    const bounds = new google.maps.LatLngBounds()

    for (let i = 0; i < markers.length; i++) {
      const position = markers[i].getPosition()
      if (position) {
        bounds.extend(position)
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.getMap().fitBounds(bounds)
  }

  getGridSize(): number {
    return this.gridSize
  }

  setGridSize(gridSize: number): void {
    this.gridSize = gridSize
  }

  getMinimumClusterSize(): number {
    return this.minClusterSize
  }

  setMinimumClusterSize(minimumClusterSize: number): void {
    this.minClusterSize = minimumClusterSize
  }

  getMaxZoom(): number | null {
    return this.maxZoom
  }

  setMaxZoom(maxZoom: number): void {
    this.maxZoom = maxZoom
  }

  getStyles(): ClusterIconStyle[] {
    return this.styles
  }

  setStyles(styles: ClusterIconStyle[]): void {
    this.styles = styles
  }

  getTitle(): string {
    return this.title
  }

  setTitle(title: string): void {
    this.title = title
  }

  getZoomOnClick(): boolean {
    return this.zoomOnClick
  }

  setZoomOnClick(zoomOnClick: boolean): void {
    this.zoomOnClick = zoomOnClick
  }

  getAverageCenter(): boolean {
    return this.averageCenter
  }

  setAverageCenter(averageCenter: boolean): void {
    this.averageCenter = averageCenter
  }

  getIgnoreHidden(): boolean {
    return this.ignoreHidden
  }

  setIgnoreHidden(ignoreHidden: boolean): void {
    this.ignoreHidden = ignoreHidden
  }

  getEnableRetinaIcons(): boolean {
    return this.enableRetinaIcons
  }

  setEnableRetinaIcons(enableRetinaIcons: boolean): void {
    this.enableRetinaIcons = enableRetinaIcons
  }

  getImageExtension(): string {
    return this.imageExtension
  }

  setImageExtension(imageExtension: string): void {
    this.imageExtension = imageExtension
  }

  getImagePath(): string {
    return this.imagePath
  }

  setImagePath(imagePath: string): void {
    this.imagePath = imagePath
  }

  getImageSizes(): number[] {
    return this.imageSizes
  }

  setImageSizes(imageSizes: number[]): void {
    this.imageSizes = imageSizes
  }

  getCalculator(): TCalculator {
    return this.calculator
  }

  setCalculator(calculator: TCalculator): void {
    this.calculator = calculator
  }

  getBatchSizeIE(): number {
    return this.batchSizeIE
  }

  setBatchSizeIE(batchSizeIE: number): void {
    this.batchSizeIE = batchSizeIE
  }

  getClusterClass(): string {
    return this.clusterClass
  }

  setClusterClass(clusterClass: string): void {
    this.clusterClass = clusterClass
  }

  getMarkers(): MarkerExtended[] {
    return this.markers
  }

  getTotalMarkers(): number {
    return this.markers.length
  }

  getClusters(): Cluster[] {
    return this.clusters
  }

  getTotalClusters(): number {
    return this.clusters.length
  }

  addMarker(marker: MarkerExtended, optNoDraw: boolean): void {
    this.pushMarkerTo(marker)

    if (!optNoDraw) {
      this.redraw()
    }
  }

  addMarkers(markers: MarkerExtended[], optNoDraw: boolean): void {
    for (const key in markers) {
      // eslint-disable-next-line no-prototype-builtins
      if (markers.hasOwnProperty(key)) {
        this.pushMarkerTo(markers[key])
      }
    }

    if (!optNoDraw) {
      this.redraw()
    }
  }

  pushMarkerTo(marker: MarkerExtended): void {
    // If the marker is draggable add a listener so we can update the clusters on the dragend:
    if (marker.getDraggable()) {
      google.maps.event.addListener(marker, 'dragend', () => {
        if (this.ready) {
          marker.isAdded = false

          this.repaint()
        }
      })
    }

    marker.isAdded = false

    this.markers.push(marker)
  }

  removeMarker_(marker: MarkerExtended): boolean {
    let index = -1

    if (this.markers.indexOf) {
      index = this.markers.indexOf(marker)
    } else {
      for (let i = 0; i < this.markers.length; i++) {
        if (marker === this.markers[i]) {
          index = i

          break
        }
      }
    }

    if (index === -1) {
      // Marker is not in our list of markers, so do nothing:
      return false
    }

    marker.setMap(null)

    this.markers.splice(index, 1) // Remove the marker from the list of managed markers

    return true
  }

  removeMarker(marker: MarkerExtended, optNoDraw: boolean): boolean {
    const removed = this.removeMarker_(marker)

    if (!optNoDraw && removed) {
      this.repaint()
    }

    return removed
  }

  removeMarkers(markers: MarkerExtended[], optNoDraw: boolean): boolean {
    let removed = false

    for (let i = 0; i < markers.length; i++) {
      removed = removed || this.removeMarker_(markers[i])
    }

    if (!optNoDraw && removed) {
      this.repaint()
    }

    return removed
  }

  clearMarkers(): void {
    this.resetViewport(true)

    this.markers = []
  }

  repaint(): void {
    const oldClusters = this.clusters.slice()

    this.clusters = []

    this.resetViewport(false)

    this.redraw()

    // Remove the old clusters.
    // Do it in a timeout to prevent blinking effect.
    setTimeout(function timeout() {
      for (let i = 0; i < oldClusters.length; i++) {
        oldClusters[i].remove()
      }
    }, 0)
  }

  getExtendedBounds(
    bounds: google.maps.LatLngBounds
  ): google.maps.LatLngBounds {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const projection = this.getProjection()
    // Convert the points to pixels and the extend out by the grid size.
    const trPix = projection.fromLatLngToDivPixel(
      // Turn the bounds into latlng.
      new google.maps.LatLng(
        bounds.getNorthEast().lat(),
        bounds.getNorthEast().lng()
      )
    )

    trPix.x += this.gridSize
    trPix.y -= this.gridSize

    const blPix = projection.fromLatLngToDivPixel(
      // Turn the bounds into latlng.
      new google.maps.LatLng(
        bounds.getSouthWest().lat(),
        bounds.getSouthWest().lng()
      )
    )

    blPix.x -= this.gridSize
    blPix.y += this.gridSize

    // Extend the bounds to contain the new bounds.
    bounds.extend(
      // Convert the pixel points back to LatLng nw
      projection.fromDivPixelToLatLng(trPix)
    )

    bounds.extend(
      // Convert the pixel points back to LatLng sw
      projection.fromDivPixelToLatLng(blPix)
    )

    return bounds
  }

  redraw(): void {
    // Redraws all the clusters.
    this.createClusters(0)
  }

  resetViewport(optHide: boolean): void {
    // Remove all the clusters
    for (let i = 0; i < this.clusters.length; i++) {
      this.clusters[i].remove()
    }

    this.clusters = []

    // Reset the markers to not be added and to be removed from the map.
    for (let i = 0; i < this.markers.length; i++) {
      const marker = this.markers[i]

      marker.isAdded = false

      if (optHide) {
        marker.setMap(null)
      }
    }
  }

  distanceBetweenPoints(
    p1: google.maps.LatLng,
    p2: google.maps.LatLng
  ): number {
    const R = 6371 // Radius of the Earth in km

    const dLat = ((p2.lat() - p1.lat()) * Math.PI) / 180
    const dLon = ((p2.lng() - p1.lng()) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat() * Math.PI) / 180) *
        Math.cos((p2.lat() * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
  }

  isMarkerInBounds(
    marker: MarkerExtended,
    bounds: google.maps.LatLngBounds
  ): boolean {
    const position = marker.getPosition()

    if (position) {
      return bounds.contains(position)
    }

    return false
  }

  addToClosestCluster(marker: MarkerExtended): void {
    let cluster

    let distance = 40000 // Some large number

    let clusterToAddTo = null

    for (let i = 0; i < this.clusters.length; i++) {
      cluster = this.clusters[i]

      const center = cluster.getCenter()

      const position = marker.getPosition()

      if (center && position) {
        const d = this.distanceBetweenPoints(center, position)

        if (d < distance) {
          distance = d

          clusterToAddTo = cluster
        }
      }
    }

    if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
      clusterToAddTo.addMarker(marker)
    } else {
      cluster = new Cluster(this)

      cluster.addMarker(marker)

      this.clusters.push(cluster)
    }
  }

  createClusters(iFirst: number): void {
    if (!this.ready) {
      return
    }

    // Cancel previous batch processing if we're working on the first batch:
    if (iFirst === 0) {
      /**
       * This event is fired when the <code>Clusterer</code> begins
       *  clustering markers.
       * @name Clusterer#clusteringbegin
       * @param {Clusterer} mc The Clusterer whose markers are being clustered.
       * @event
       */
      google.maps.event.trigger(this, 'clusteringbegin', this)

      if (this.timerRefStatic !== null) {
        window.clearTimeout(this.timerRefStatic)

        delete this.timerRefStatic
      }
    }

    // Get our current map view bounds.
    // Create a new bounds object so we don't affect the map.
    //
    // See Comments 9 & 11 on Issue 3651 relating to this workaround for a Google Maps bug:
    const mapBounds =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.getMap().getZoom() > 3
        ? new google.maps.LatLngBounds(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.getMap()
              .getBounds()
              .getSouthWest(),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.getMap()
              .getBounds()
              .getNorthEast()
          )
        : new google.maps.LatLngBounds(
            new google.maps.LatLng(85.02070771743472, -178.48388434375),
            new google.maps.LatLng(-85.08136444384544, 178.00048865625)
          )

    const bounds = this.getExtendedBounds(mapBounds)

    const iLast = Math.min(iFirst + this.batchSize, this.markers.length)

    for (let i = iFirst; i < iLast; i++) {
      const marker = this.markers[i]

      if (!marker.isAdded && this.isMarkerInBounds(marker, bounds)) {
        if (!this.ignoreHidden || (this.ignoreHidden && marker.getVisible())) {
          this.addToClosestCluster(marker)
        }
      }
    }

    if (iLast < this.markers.length) {
      this.timerRefStatic = window.setTimeout(() => {
        this.createClusters(iLast)
      }, 0)
    } else {
      this.timerRefStatic = null

      /**
       * This event is fired when the <code>Clusterer</code> stops
       *  clustering markers.
       * @name Clusterer#clusteringend
       * @param {Clusterer} mc The Clusterer whose markers are being clustered.
       * @event
       */
      google.maps.event.trigger(this, 'clusteringend', this)

      for (let i = 0; i < this.clusters.length; i++) {
        this.clusters[i].updateIcon()
      }
    }
  }

  extend(obj1: unknown, obj2: unknown): unknown {
    return function applyExtend(object: unknown) {
      // eslint-disable-next-line guard-for-in
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (const property in object.prototype) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.prototype[property] = object.prototype[property]
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this
    }.apply(obj1, [obj2])
  }
}
