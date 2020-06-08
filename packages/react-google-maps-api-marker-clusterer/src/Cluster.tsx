/* global google */
import { Clusterer } from './Clusterer'

import { ClusterIcon } from './ClusterIcon'

import { MarkerExtended } from './types'

export class Cluster {
  markerClusterer: Clusterer
  map: google.maps.Map | google.maps.StreetViewPanorama
  gridSize: number
  minClusterSize: number
  averageCenter: boolean
  markers: MarkerExtended[]
  center: google.maps.LatLng | undefined
  bounds: google.maps.LatLngBounds | null
  clusterIcon: ClusterIcon

  constructor(markerClusterer: Clusterer) {
    this.markerClusterer = markerClusterer
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.map = this.markerClusterer.getMap()

    this.gridSize = this.markerClusterer.getGridSize()

    this.minClusterSize = this.markerClusterer.getMinimumClusterSize()

    this.averageCenter = this.markerClusterer.getAverageCenter()

    this.markers = []

    this.center = undefined

    this.bounds = null

    this.clusterIcon = new ClusterIcon(this, this.markerClusterer.getStyles())
  }

  getSize(): number {
    return this.markers.length
  }

  getMarkers(): MarkerExtended[] {
    return this.markers
  }

  getCenter(): google.maps.LatLng | undefined {
    return this.center
  }

  getMap(): google.maps.Map | google.maps.StreetViewPanorama {
    return this.map
  }

  getClusterer(): Clusterer {
    return this.markerClusterer
  }

  getBounds(): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds(this.center, this.center)

    const markers = this.getMarkers()

    for (let i = 0; i < markers.length; i++) {
      const position = markers[i].getPosition()

      if (position) {
        bounds.extend(position)
      }
    }

    return bounds
  }

  remove(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.clusterIcon.setMap(null)

    this.markers = []

    delete this.markers
  }

  addMarker(marker: MarkerExtended): boolean {
    if (this.isMarkerAlreadyAdded(marker)) {
      return false
    }

    if (!this.center) {
      const position = marker.getPosition()

      if (position) {
        this.center = position

        this.calculateBounds()
      }
    } else {
      if (this.averageCenter) {
        const position = marker.getPosition()

        if (position) {
          const length = this.markers.length + 1

          this.center = new google.maps.LatLng(
            (this.center.lat() * (length - 1) + position.lat()) / length,
            (this.center.lng() * (length - 1) + position.lng()) / length
          )

          this.calculateBounds()
        }
      }
    }

    marker.isAdded = true

    this.markers.push(marker)

    const mCount = this.markers.length

    const maxZoom = this.markerClusterer.getMaxZoom()

    if (maxZoom !== null && this.map.getZoom() > maxZoom) {
      // Zoomed in past max zoom, so show the marker.
      if (marker.getMap() !== this.map) {
        marker.setMap(this.map)
      }
    } else if (mCount < this.minClusterSize) {
      // Min cluster size not reached so show the marker.
      if (marker.getMap() !== this.map) {
        marker.setMap(this.map)
      }
    } else if (mCount === this.minClusterSize) {
      // Hide the markers that were showing.
      for (let i = 0; i < mCount; i++) {
        this.markers[i].setMap(null)
      }
    } else {
      marker.setMap(null)
    }

    return true
  }

  isMarkerInClusterBounds(marker: MarkerExtended): boolean {
    if (this.bounds !== null) {
      const position = marker.getPosition()

      if (position) {
        return this.bounds.contains(position)
      }
    }

    return false
  }

  calculateBounds(): void {
    this.bounds = this.markerClusterer.getExtendedBounds(
      new google.maps.LatLngBounds(this.center, this.center)
    )
  }

  updateIcon(): void {
    const mCount = this.markers.length

    const maxZoom = this.markerClusterer.getMaxZoom()

    if (maxZoom !== null && this.map.getZoom() > maxZoom) {
      this.clusterIcon.hide()

      return
    }

    if (mCount < this.minClusterSize) {
      // Min cluster size not yet reached.
      this.clusterIcon.hide()

      return
    }

    if (this.center) {
      this.clusterIcon.setCenter(this.center)
    }

    this.clusterIcon.useStyle(
      this.markerClusterer.getCalculator()(
        this.markers,
        this.markerClusterer.getStyles().length
      )
    )

    this.clusterIcon.show()
  }

  isMarkerAlreadyAdded(marker: MarkerExtended): boolean {
    if (this.markers.includes) {
      return this.markers.includes(marker)
    } else {
      for (let i = 0; i < this.markers.length; i++) {
        if (marker === this.markers[i]) {
          return true
        }
      }
    }

    return false
  }
}
