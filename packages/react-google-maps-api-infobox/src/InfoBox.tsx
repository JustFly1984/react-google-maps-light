/* global google */
import { InfoBoxOptions } from './types'

export class InfoBox {
  content: string | Node
  disableAutoPan: boolean
  maxWidth: number
  pixelOffset: google.maps.Size
  position: google.maps.LatLng
  zIndex: number | undefined | null
  boxClass: string
  boxStyle: {
    [key: string]: unknown
  }

  closeBoxMargin: string
  closeBoxURL: string
  infoBoxClearance: google.maps.Size
  isHidden: boolean
  alignBottom: boolean
  pane: string
  enableEventPropagation: boolean
  div: HTMLDivElement | null
  closeListener: google.maps.MapsEventListener | null
  moveListener: google.maps.MapsEventListener | null
  mapListener: google.maps.MapsEventListener | null
  contextListener: google.maps.MapsEventListener | null
  eventListeners: google.maps.MapsEventListener[] | null
  fixedWidthSet: boolean | null

  constructor(options: InfoBoxOptions = {}) {
    this.extend(InfoBox, google.maps.OverlayView)

    // Standard options (in common with google.maps.InfoWindow):
    this.content = options.content || ''
    this.disableAutoPan = options.disableAutoPan || false
    this.maxWidth = options.maxWidth || 0
    this.pixelOffset = options.pixelOffset || new google.maps.Size(0, 0)
    this.position = options.position || new google.maps.LatLng(0, 0)
    this.zIndex = options.zIndex || null

    // Additional options (unique to InfoBox):
    this.boxClass = options.boxClass || 'infoBox'
    this.boxStyle = options.boxStyle || {}
    this.closeBoxMargin = options.closeBoxMargin || '2px'
    this.closeBoxURL =
      options.closeBoxURL ||
      'http://www.google.com/intl/en_us/mapfiles/close.gif'
    if (options.closeBoxURL === '') {
      this.closeBoxURL = ''
    }
    this.infoBoxClearance =
      options.infoBoxClearance || new google.maps.Size(1, 1)

    if (typeof options.visible === 'undefined') {
      if (typeof options.isHidden === 'undefined') {
        options.visible = true
      } else {
        options.visible = !options.isHidden
      }
    }
    this.isHidden = !options.visible

    this.alignBottom = options.alignBottom || false
    this.pane = options.pane || 'floatPane'
    this.enableEventPropagation = options.enableEventPropagation || false

    this.div = null
    this.closeListener = null
    this.moveListener = null
    this.mapListener = null
    this.contextListener = null
    this.eventListeners = null
    this.fixedWidthSet = null
  }

  createInfoBoxDiv(): void {
    // This handler prevents an event in the InfoBox from being passed on to the map.
    function cancelHandler(event: Event): void {
      event.cancelBubble = true
      if (event.stopPropagation) {
        event.stopPropagation()
      }
    }

    // This handler ignores the current event in the InfoBox and conditionally prevents
    // the event from being passed on to the map. It is used for the contextmenu event.
    const ignoreHandler = (event: Event): void => {
      event.returnValue = false

      if (event.preventDefault) {
        event.preventDefault()
      }

      if (!this.enableEventPropagation) {
        cancelHandler(event)
      }
    }

    if (!this.div) {
      this.div = document.createElement('div')
      this.setBoxStyle()

      if (typeof this.content === 'string') {
        this.div.innerHTML = this.getCloseBoxImg() + this.content
      } else {
        this.div.innerHTML = this.getCloseBoxImg()
        this.div.appendChild(this.content)
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const panes = this.getPanes()
      panes[this.pane].appendChild(this.div) // Add the InfoBox div to the DOM

      this.addClickHandler()

      if (this.div.style.width) {
        this.fixedWidthSet = true
      } else {
        if (this.maxWidth !== 0 && this.div.offsetWidth > this.maxWidth) {
          this.div.style.width = this.maxWidth + 'px'
          this.fixedWidthSet = true
        } else {
          // The following code is needed to overcome problems with MSIE
          const bw = this.getBoxWidths()
          this.div.style.width =
            this.div.offsetWidth - bw.left - bw.right + 'px'
          this.fixedWidthSet = false
        }
      }

      this.panBox(this.disableAutoPan)

      if (!this.enableEventPropagation) {
        this.eventListeners = []

        // Cancel event propagation.
        // Note: mousemove not included (to resolve Issue 152)
        const events = [
          'mousedown',
          'mouseover',
          'mouseout',
          'mouseup',
          'click',
          'dblclick',
          'touchstart',
          'touchend',
          'touchmove',
        ]

        for (let i = 0; i < events.length; i++) {
          this.eventListeners.push(
            google.maps.event.addDomListener(this.div, events[i], cancelHandler)
          )
        }

        // Workaround for Google bug that causes the cursor to change to a pointer
        // when the mouse moves over a marker underneath InfoBox.
        this.eventListeners.push(
          google.maps.event.addDomListener(this.div, 'mouseover', () => {
            if (this.div) {
              this.div.style.cursor = 'default'
            }
          })
        )
      }

      this.contextListener = google.maps.event.addDomListener(
        this.div,
        'contextmenu',
        ignoreHandler
      )

      /**
       * This event is fired when the DIV containing the InfoBox's content is attached to the DOM.
       * @name InfoBox#domready
       * @event
       */
      google.maps.event.trigger(this, 'domready')
    }
  }

  getCloseBoxImg(): string {
    let img = ''

    if (this.closeBoxURL !== '') {
      img = '<img'
      img += " src='" + this.closeBoxURL + "'"
      img += ' align=right' // Do this because Opera chokes on style='float: right;'
      img += " style='"
      img += ' position: relative;' // Required by MSIE
      img += ' cursor: pointer;'
      img += ' margin: ' + this.closeBoxMargin + ';'
      img += "'>"
    }

    return img
  }

  addClickHandler(): void {
    if (this.div && this.div.firstChild && this.closeBoxURL !== '') {
      const closeBox = this.div.firstChild
      this.closeListener = google.maps.event.addDomListener(
        closeBox,
        'click',
        this.getCloseClickHandler()
      )
    } else {
      this.closeListener = null
    }
  }

  getCloseClickHandler() {
    return (event: Event): void => {
      // 1.0.3 fix: Always prevent propagation of a close box click to the map:
      event.cancelBubble = true

      if (event.stopPropagation) {
        event.stopPropagation()
      }

      /**
       * This event is fired when the InfoBox's close box is clicked.
       * @name InfoBox#closeclick
       * @event
       */
      google.maps.event.trigger(this, 'closeclick')

      this.close()
    }
  }

  panBox(disablePan?: boolean): void {
    if (this.div && !disablePan) {
      const map:
        | google.maps.Map
        | google.maps.StreetViewPanorama
        | null
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        | undefined = this.getMap()

      // Only pan if attached to map, not panorama
      if (map instanceof google.maps.Map) {
        let xOffset = 0
        let yOffset = 0

        const bounds = map.getBounds()
        if (bounds && !bounds.contains(this.position)) {
          // Marker not in visible area of map, so set center
          // of map to the marker position first.
          map.setCenter(this.position)
        }

        const mapDiv = map.getDiv()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const mapWidth = mapDiv.offsetWidth
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const mapHeight = mapDiv.offsetHeight
        const iwOffsetX = this.pixelOffset.width
        const iwOffsetY = this.pixelOffset.height
        const iwWidth = this.div.offsetWidth
        const iwHeight = this.div.offsetHeight
        const padX = this.infoBoxClearance.width
        const padY = this.infoBoxClearance.height

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const projection: google.maps.MapCanvasProjection = this.getProjection()
        const pixPosition = projection.fromLatLngToContainerPixel(this.position)

        if (pixPosition.x < -iwOffsetX + padX) {
          xOffset = pixPosition.x + iwOffsetX - padX
        } else if (pixPosition.x + iwWidth + iwOffsetX + padX > mapWidth) {
          xOffset = pixPosition.x + iwWidth + iwOffsetX + padX - mapWidth
        }
        if (this.alignBottom) {
          if (pixPosition.y < -iwOffsetY + padY + iwHeight) {
            yOffset = pixPosition.y + iwOffsetY - padY - iwHeight
          } else if (pixPosition.y + iwOffsetY + padY > mapHeight) {
            yOffset = pixPosition.y + iwOffsetY + padY - mapHeight
          }
        } else {
          if (pixPosition.y < -iwOffsetY + padY) {
            yOffset = pixPosition.y + iwOffsetY - padY
          } else if (pixPosition.y + iwHeight + iwOffsetY + padY > mapHeight) {
            yOffset = pixPosition.y + iwHeight + iwOffsetY + padY - mapHeight
          }
        }

        if (!(xOffset === 0 && yOffset === 0)) {
          // Move the map to the shifted center.
          map.panBy(xOffset, yOffset)
        }
      }
    }
  }

  setBoxStyle(): void {
    if (this.div) {
      // Apply style values from the style sheet defined in the boxClass parameter:
      this.div.className = this.boxClass

      // Clear existing inline style values:
      this.div.style.cssText = ''

      // Apply style values defined in the boxStyle parameter:
      const boxStyle = this.boxStyle

      for (const i in boxStyle) {
        // eslint-disable-next-line no-prototype-builtins
        if (boxStyle.hasOwnProperty(i)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.div.style[i] = boxStyle[i]
        }
      }

      // Fix for iOS disappearing InfoBox problem
      // See http://stackoverflow.com/questions/9229535/google-maps-markers-disappear-at-certain-zoom-level-only-on-iphone-ipad
      this.div.style.webkitTransform = 'translateZ(0)'

      // Fix up opacity style for benefit of MSIE
      if (
        typeof this.div.style.opacity !== 'undefined' &&
        this.div.style.opacity !== ''
      ) {
        // See http://www.quirksmode.org/css/opacity.html
        const opacity = parseFloat(this.div.style.opacity || '')

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.div.style.msFilter =
          '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' +
          opacity * 100 +
          ')"'
        this.div.style.filter = 'alpha(opacity=' + opacity * 100 + ')'
      }

      // Apply required styles
      this.div.style.position = 'absolute'
      this.div.style.visibility = 'hidden'
      if (this.zIndex !== null) {
        this.div.style.zIndex = this.zIndex + ''
      }
      if (!this.div.style.overflow) {
        this.div.style.overflow = 'auto'
      }
    }
  }

  getBoxWidths(): { bottom: number; left: number; right: number; top: number } {
    const bw = { top: 0, bottom: 0, left: 0, right: 0 }

    if (!this.div) {
      return bw
    }

    if (document.defaultView && document.defaultView.getComputedStyle) {
      const ownerDocument = this.div.ownerDocument
      const computedStyle =
        ownerDocument && ownerDocument.defaultView
          ? ownerDocument.defaultView.getComputedStyle(this.div, '')
          : null

      if (computedStyle) {
        // The computed styles are always in pixel units (good!)
        bw.top = parseInt(computedStyle.borderTopWidth || '', 10) || 0
        bw.bottom = parseInt(computedStyle.borderBottomWidth || '', 10) || 0
        bw.left = parseInt(computedStyle.borderLeftWidth || '', 10) || 0
        bw.right = parseInt(computedStyle.borderRightWidth || '', 10) || 0
      }
    } else if (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      document.documentElement.currentStyle // MSIE
    ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const currentStyle = this.div.currentStyle

      if (currentStyle) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // The current styles may not be in pixel units, but assume they are (bad!)
        bw.top = parseInt(currentStyle.borderTopWidth || '', 10) || 0
        bw.bottom = parseInt(currentStyle.borderBottomWidth || '', 10) || 0
        bw.left = parseInt(currentStyle.borderLeftWidth || '', 10) || 0
        bw.right = parseInt(currentStyle.borderRightWidth || '', 10) || 0
      }
    }

    return bw
  }

  onRemove(): void {
    if (this.div && this.div.parentNode) {
      this.div.parentNode.removeChild(this.div)
      this.div = null
    }
  }

  draw(): void {
    this.createInfoBoxDiv()

    if (this.div) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const projection: google.maps.MapCanvasProjection = this.getProjection()
      const pixPosition = projection.fromLatLngToDivPixel(this.position)

      this.div.style.left = pixPosition.x + this.pixelOffset.width + 'px'

      if (this.alignBottom) {
        this.div.style.bottom =
          -(pixPosition.y + this.pixelOffset.height) + 'px'
      } else {
        this.div.style.top = pixPosition.y + this.pixelOffset.height + 'px'
      }

      if (this.isHidden) {
        this.div.style.visibility = 'hidden'
      } else {
        this.div.style.visibility = 'visible'
      }
    }
  }

  setOptions(options: InfoBoxOptions = {}): void {
    if (typeof options.boxClass !== 'undefined') {
      // Must be first
      this.boxClass = options.boxClass
      this.setBoxStyle()
    }
    if (typeof options.boxStyle !== 'undefined') {
      // Must be second
      this.boxStyle = options.boxStyle
      this.setBoxStyle()
    }
    if (typeof options.content !== 'undefined') {
      this.setContent(options.content)
    }
    if (typeof options.disableAutoPan !== 'undefined') {
      this.disableAutoPan = options.disableAutoPan
    }
    if (typeof options.maxWidth !== 'undefined') {
      this.maxWidth = options.maxWidth
    }
    if (typeof options.pixelOffset !== 'undefined') {
      this.pixelOffset = options.pixelOffset
    }
    if (typeof options.alignBottom !== 'undefined') {
      this.alignBottom = options.alignBottom
    }
    if (typeof options.position !== 'undefined') {
      this.setPosition(options.position)
    }
    if (typeof options.zIndex !== 'undefined') {
      this.setZIndex(options.zIndex)
    }
    if (typeof options.closeBoxMargin !== 'undefined') {
      this.closeBoxMargin = options.closeBoxMargin
    }
    if (typeof options.closeBoxURL !== 'undefined') {
      this.closeBoxURL = options.closeBoxURL
    }
    if (typeof options.infoBoxClearance !== 'undefined') {
      this.infoBoxClearance = options.infoBoxClearance
    }
    if (typeof options.isHidden !== 'undefined') {
      this.isHidden = options.isHidden
    }
    if (typeof options.visible !== 'undefined') {
      this.isHidden = !options.visible
    }
    if (typeof options.enableEventPropagation !== 'undefined') {
      this.enableEventPropagation = options.enableEventPropagation
    }

    if (this.div) {
      this.draw()
    }
  }

  setContent(content: string | Node): void {
    this.content = content

    if (this.div) {
      if (this.closeListener) {
        google.maps.event.removeListener(this.closeListener)
        this.closeListener = null
      }

      // Odd code required to make things work with MSIE.
      if (!this.fixedWidthSet) {
        this.div.style.width = ''
      }

      if (typeof content === 'string') {
        this.div.innerHTML = this.getCloseBoxImg() + content
      } else {
        this.div.innerHTML = this.getCloseBoxImg()
        this.div.appendChild(content)
      }

      // Perverse code required to make things work with MSIE.
      // (Ensures the close box does, in fact, float to the right.)
      if (!this.fixedWidthSet) {
        this.div.style.width = this.div.offsetWidth + 'px'
        if (typeof content === 'string') {
          this.div.innerHTML = this.getCloseBoxImg() + content
        } else {
          this.div.innerHTML = this.getCloseBoxImg()
          this.div.appendChild(content)
        }
      }

      this.addClickHandler()
    }

    /**
     * This event is fired when the content of the InfoBox changes.
     * @name InfoBox#content_changed
     * @event
     */
    google.maps.event.trigger(this, 'content_changed')
  }

  setPosition(latLng: google.maps.LatLng): void {
    this.position = latLng

    if (this.div) {
      this.draw()
    }

    /**
     * This event is fired when the position of the InfoBox changes.
     * @name InfoBox#position_changed
     * @event
     */
    google.maps.event.trigger(this, 'position_changed')
  }

  setVisible(isVisible: boolean): void {
    this.isHidden = !isVisible
    if (this.div) {
      this.div.style.visibility = this.isHidden ? 'hidden' : 'visible'
    }
  }

  setZIndex(index: number): void {
    this.zIndex = index

    if (this.div) {
      this.div.style.zIndex = index + ''
    }

    /**
     * This event is fired when the zIndex of the InfoBox changes.
     * @name InfoBox#zindex_changed
     * @event
     */
    google.maps.event.trigger(this, 'zindex_changed')
  }

  getContent(): string | Node {
    return this.content
  }

  getPosition(): google.maps.LatLng {
    return this.position
  }

  getZIndex(): number | null | undefined {
    return this.zIndex
  }

  getVisible(): boolean {
    const map:
      | google.maps.Map
      | google.maps.StreetViewPanorama
      | null
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      | undefined = this.getMap()

    let isVisible: boolean

    if (typeof map === 'undefined' || map === null) {
      isVisible = false
    } else {
      isVisible = !this.isHidden
    }

    return isVisible
  }

  show(): void {
    this.isHidden = false
    if (this.div) {
      this.div.style.visibility = 'visible'
    }
  }

  hide(): void {
    this.isHidden = true
    if (this.div) {
      this.div.style.visibility = 'hidden'
    }
  }

  open(
    map: google.maps.Map | google.maps.StreetViewPanorama,
    anchor?: google.maps.MVCObject
  ): void {
    if (anchor) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.position = anchor.getPosition()
      this.moveListener = google.maps.event.addListener(
        anchor,
        'position_changed',
        () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const position = anchor.getPosition()
          this.setPosition(position)
        }
      )

      this.mapListener = google.maps.event.addListener(
        anchor,
        'map_changed',
        () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.setMap(anchor.map)
        }
      )
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.setMap(map)

    if (this.div) {
      this.panBox()
    }
  }

  close(): void {
    if (this.closeListener) {
      google.maps.event.removeListener(this.closeListener)
      this.closeListener = null
    }

    if (this.eventListeners) {
      for (let i = 0; i < this.eventListeners.length; i++) {
        google.maps.event.removeListener(this.eventListeners[i])
      }
      this.eventListeners = null
    }

    if (this.moveListener) {
      google.maps.event.removeListener(this.moveListener)
      this.moveListener = null
    }

    if (this.mapListener) {
      google.maps.event.removeListener(this.mapListener)
      this.mapListener = null
    }

    if (this.contextListener) {
      google.maps.event.removeListener(this.contextListener)
      this.contextListener = null
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.setMap(null)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  extend(obj1: unknown, obj2: unknown): (object: unknown) => unknown {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return function applyExtend(object: unknown) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (const property in object.prototype) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-prototype-builtins
        if (!this.prototype.hasOwnProperty(property)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.prototype[property] = object.prototype[property]
        }
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this
    }.apply(obj1, [obj2])
  }
}
