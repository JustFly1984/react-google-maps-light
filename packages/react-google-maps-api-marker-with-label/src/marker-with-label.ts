/**
 * @name MarkerWithLabel for V3
 * @version 1.1.9 [June 30, 2013]
 * @author Gary Little (inspired by code from Marc Ridey of Google).
 * @copyright Copyright 2012 Gary Little [gary at luxcentral.com]
 * @fileoverview MarkerWithLabel extends the Google Maps JavaScript API V3
 *  <code>google.maps.Marker</code> class.
 *  <p>
 *  MarkerWithLabel allows you to define markers with associated labels. As you would expect,
 *  if the marker is draggable, so too will be the label. In addition, a marker with a label
 *  responds to all mouse events in the same manner as a regular marker. It also fires mouse
 *  events and "property changed" events just as a regular marker would. Version 1.1 adds
 *  support for the raiseOnDrag feature introduced in API V3.3.
 *  <p>
 *  If you drag a marker by its label, you can cancel the drag and return the marker to its
 *  original position by pressing the <code>Esc</code> key. This doesn't work if you drag the marker
 *  itself because this feature is not (yet) supported in the <code>google.maps.Marker</code> class.
 */

/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global document,google */

// Stops all processing of an event.
//
function cAbortEvent(event: Event) {
  if (event.preventDefault) {
    event.preventDefault()
  }

  event.cancelBubble = true

  if (event.stopPropagation) {
    event.stopPropagation()
  }
}



function fromLatLngToDivPixel(map: google.maps.Map, position: google.maps.LatLng): google.maps.Point | undefined {
  const projection = map.getProjection()
  const bounds = map.getBounds()

  if (projection !== null && typeof bounds !== 'undefined' && bounds !== null) {
    const scale = Math.pow(2, map.getZoom())

    const point1 = projection.fromLatLngToPoint(position)
    const point2 = projection.fromLatLngToPoint(
      new google.maps.LatLng(
        bounds.getNorthEast().lat(),
        bounds.getSouthWest().lng()
      )
    )

    return new google.maps.Point(
      Math.floor((point1.x - point2.x) * scale),
      Math.floor((point1.y - point2.y) * scale));
  }

  return
}

function fromPixelToLatLng(map: google.maps.Map, point1: google.maps.Point): google.maps.LatLng | undefined {
  const projection = map.getProjection()
  const bounds = map.getBounds()

  if (projection !== null && typeof bounds !== 'undefined' && bounds !== null) {
    const scale = Math.pow(2, map.getZoom())

    const point2 = projection.fromLatLngToPoint(
      new google.maps.LatLng(
        bounds.getNorthEast().lat(),
        bounds.getSouthWest().lng()
      )
    )

    return projection.fromPointToLatLng(
      new google.maps.Point(
        point1.x / scale + point2.x,
        point1.y / scale + point2.y
      )
    )
  }

  return
}

/**
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
function inherits(childCtor: Function, parentCtor: Function) {
  /** @constructor */
  class tempCtor{};

  tempCtor.prototype = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;
}

class MarkerLabel extends google.maps.OverlayView{
  marker_: google.maps.Marker
  handCursorURL_: string
  labelDiv_: HTMLDivElement
  eventDiv_: HTMLDivElement
  crossDiv_: HTMLDivElement
  getSharedCrossDiv_?: HTMLImageElement
  getSharedCrossProcessed_?: boolean
  listeners_: google.maps.MapsEventListener[]

  /**
   * This constructor creates a label and associates it with a marker.
   * It is for the private use of the MarkerWithLabel class.
   * @constructor
   * @param {Marker} marker The marker with which the label is to be associated.
   * @param {string} crossURL The URL of the cross image =.
   * @param {string} handCursor The URL of the hand cursor.
   * @private
  */
  constructor (marker: google.maps.Marker, crossURL: string, handCursorURL: string) {
    super()

    this.marker_ = marker
    this.handCursorURL_ = handCursorURL

    this.labelDiv_ = document.createElement("div")
    this.labelDiv_.style.cssText = "position: absolute; overflow: hidden;"

    // Set up the DIV for handling mouse events in the label. This DIV forms a transparent veil
    // in the "overlayMouseTarget" pane, a veil that covers just the label. This is done so that
    // events can be captured even if the label is in the shadow of a google.maps.InfoWindow.
    // Code is included here to ensure the veil is always exactly the same size as the label.
    this.eventDiv_ = document.createElement("div")
    this.eventDiv_.style.cssText = this.labelDiv_.style.cssText

    // This is needed for proper behavior on MSIE:
    this.eventDiv_.addEventListener('selectstart', () => false);
    this.eventDiv_.addEventListener('dragstart', () => false);

    // Get the DIV for the "X" to be displayed when the marker is raised.
    this.crossDiv_ = this.getSharedCross(crossURL);
    this.listeners_ = []
  }

  /**
 * Returns the DIV for the cross used when dragging a marker when the
 * raiseOnDrag parameter set to true. One cross is shared with all markers.
 * @param {string} crossURL The URL of the cross image =.
 * @private
 */
  getSharedCross(crossURL: string): HTMLImageElement {
    if (typeof this.getSharedCrossDiv_ === "undefined") {
      const img = document.createElement("img")
      img.style.cssText = "position: absolute; z-index: 1000002; display: none;"
      // Hopefully Google never changes the standard "X" attributes:
      img.style.marginLeft = "-8px"
      img.style.marginTop = "-9px"
      img.src = crossURL
      this.getSharedCrossDiv_ = img
    }

    return this.getSharedCrossDiv_
  }

  /**
   * Adds the DIV representing the label to the DOM. This method is called
   * automatically when the marker's <code>setMap</code> method is called.
   * @private
   */
  onAdd() {
    let cMouseIsDown = false
    let cDraggingLabel = false
    let cSavedZIndex: number | null | undefined = 0
    let cLatOffset = 0
    let cLngOffset = 0
    let cIgnoreClick: boolean = false
    let cRaiseEnabled: boolean = false
    let cStartPosition
    let cStartCenter


    const cRaiseOffset = 20
    const cDraggingCursor = "url(" + this.handCursorURL_ + ")"

    const cStopBounce = () => {
      this.marker_.setAnimation(null)
    }

    this.getPanes().markerLayer.appendChild(this.labelDiv_)
    this.getPanes().overlayMouseTarget.appendChild(this.eventDiv_)
    // One cross is shared with all markers, so only add it once:
    if (typeof this.getSharedCrossProcessed_ === "undefined") {
      this.getPanes().markerLayer.appendChild(this.crossDiv_)

      this.getSharedCrossProcessed_ = true
    }

    const map: google.maps.Map<Element> | google.maps.StreetViewPanorama | null | undefined = this.marker_.getMap()

    if (typeof map !== 'undefined' && map !== null) {
    this.listeners_ = [
      google.maps.event.addDomListener(this.eventDiv_, "mouseover", (event: Event) => {
        if (this.marker_.getDraggable() || this.marker_.getClickable()) {
          this.eventDiv_.style.cursor = "pointer"
          google.maps.event.trigger(this.marker_, "mouseover", event)
        }
      }),
      google.maps.event.addDomListener(this.eventDiv_, "mouseout", (event) => {
        if ((this.marker_.getDraggable() || this.marker_.getClickable()) && !cDraggingLabel) {
          const cursor = this.marker_.getCursor()
          if (typeof cursor !== 'undefined' && cursor !== null) {
            this.eventDiv_.style.cursor = cursor
          }

          google.maps.event.trigger(this.marker_, "mouseout", event)
        }
      }),
      google.maps.event.addDomListener(this.eventDiv_, "mousedown", (event: Event) => {
        cDraggingLabel = false

        if (this.marker_.getDraggable()) {
          cMouseIsDown = true

          this.eventDiv_.style.cursor = cDraggingCursor
        }

        if (this.marker_.getDraggable() || this.marker_.getClickable()) {
          google.maps.event.trigger(this.marker_, "mousedown", event)

          cAbortEvent(event) // Prevent map pan when starting a drag on a label
        }
      }),
      google.maps.event.addDomListener(document, "mouseup", (event: Event) => {
        let position

        if (cMouseIsDown) {
          cMouseIsDown = false

          this.eventDiv_.style.cursor = "pointer"

          google.maps.event.trigger(this.marker_, "mouseup", event)
        }

        const markerPosition = this.marker_.getPosition()

        if (cDraggingLabel) {
          if (cRaiseEnabled) { // Lower the marker & label
            if (typeof markerPosition !== 'undefined' && markerPosition !== null) {
              position = fromLatLngToDivPixel((map as google.maps.Map<Element>), markerPosition)

              if (typeof position !== 'undefined') {
                position.y += cRaiseOffset

                this.marker_.setPosition(this.getProjection().fromDivPixelToLatLng(position))
              }
            }
            // This is not the same bouncing style as when the marker portion is dragged,
            // but it will have to do:
            try { // Will fail if running Google Maps API earlier than V3.3
              this.marker_.setAnimation(google.maps.Animation.BOUNCE)

              window.setTimeout(cStopBounce, 1406)
            } catch (e) {

            }
          }

          this.crossDiv_.style.display = "none"

          if (typeof cSavedZIndex !== 'undefined') {
            this.marker_.setZIndex(cSavedZIndex)
          }

          // Set flag to ignore the click event reported after a label drag
          cIgnoreClick = true

          cDraggingLabel = false

          // (event as  google.maps.MapMouseEvent).latLng = markerPosition

          google.maps.event.trigger(this.marker_, "dragend" /* , event, markerPosition */)
        }
      }),
      google.maps.event.addListener(map, "mousemove", (event: google.maps.MapMouseEvent) => {
        let position

        if (cMouseIsDown) {
          if (cDraggingLabel) {
            // Change the reported location from the mouse position to the marker position:
            event.latLng = new google.maps.LatLng(event.latLng.lat() - cLatOffset, event.latLng.lng() - cLngOffset)

            if (typeof map.getProjection === 'function' && map !== null) {
              const projection = (map as google.maps.Map<Element>).getProjection()

              if (projection !== null) {
                position = fromLatLngToDivPixel(map, event.latLng)
              }
            }

            if (cRaiseEnabled) {
              this.crossDiv_.style.left = position.x + "px";
              this.crossDiv_.style.top = position.y + "px";
              this.crossDiv_.style.display = "";
              position.y -= cRaiseOffset;
            }

            this.marker_.setPosition(map.getProjection().fromDivPixelToLatLng(position))

            if (cRaiseEnabled) { // Don't raise the veil; this hack needed to make MSIE act properly
              this.eventDiv_.style.top = (position.y + cRaiseOffset) + "px";
            }
            google.maps.event.trigger(this.marker_, "drag", event);
          } else {
            // Calculate offsets from the click point to the marker position:
            cLatOffset = event.latLng.lat() - this.marker_.getPosition().lat()
            cLngOffset = event.latLng.lng() - this.marker_.getPosition().lng()

            cSavedZIndex = this.marker_.getZIndex()
            cStartPosition = this.marker_.getPosition()

            if (typeof map.getCenter !== "undefined") {
              cStartCenter = map.getCenter()
            }

            cRaiseEnabled = this.marker_.get("raiseOnDrag")

            cDraggingLabel = true

            this.marker_.setZIndex(1000000) // Moves the marker & label to the foreground during a drag

            const position = this.marker_.getPosition()

            if (typeof position !== "undefined" && position !== null) {
              event.latLng = position
            }


            google.maps.event.trigger(this.marker_, "dragstart", event)
          }
        }
      }),
      google.maps.event.addDomListener(document, "keydown", (event: Event) => {
        if (cDraggingLabel) {
          if ((event as KeyboardEvent).keyCode === 27) { // Esc key
            cRaiseEnabled = false

            this.marker_.setPosition(cStartPosition)

            this.marker_.getMap().setCenter(cStartCenter)

            google.maps.event.trigger(document, "mouseup", event)
          }
        }
      }),
      google.maps.event.addDomListener(this.eventDiv_, "click", (event: Event) => {
        if (this.marker_.getDraggable() || this.marker_.getClickable()) {
          if (cIgnoreClick) { // Ignore the click reported when a label drag ends
            cIgnoreClick = false
          } else {
            google.maps.event.trigger(this.marker_, "click", event)
            cAbortEvent(event); // Prevent click from being passed on to map
          }
        }
      }),
      google.maps.event.addDomListener(this.eventDiv_, "dblclick", (event: Event) => {
        if (this.marker_.getDraggable() || this.marker_.getClickable()) {
          google.maps.event.trigger(this.marker_, "dblclick", event)

          // Prevent map zoom when double-clicking on a label
          cAbortEvent(event)
        }
      }),
      google.maps.event.addListener(this.marker_, "dragstart", (/*event: google.maps.MapMouseEvent*/) => {
        if (!cDraggingLabel) {
          cRaiseEnabled = this.get("raiseOnDrag");
        }
      }),
      google.maps.event.addListener(this.marker_, "drag", (/*event: google.maps.MapMouseEvent*/) => {
        if (!cDraggingLabel) {
          if (cRaiseEnabled) {
            this.setPosition(cRaiseOffset);
            // During a drag, the marker's z-index is temporarily set to 1000000 to
            // ensure it appears above all other markers. Also set the label's z-index
            // to 1000000 (plus or minus 1 depending on whether the label is supposed
            // to be above or below the marker).
            this.labelDiv_.style.zIndex = 1000000 + (this.get("labelInBackground") ? -1 : +1) + ''
          }
        }
      }),
      google.maps.event.addListener(this.marker_, "dragend", (/* event: Event */) => {
        if (!cDraggingLabel) {
          if (cRaiseEnabled) {
            this.setPosition(0) // Also restores z-index of label
          }
        }
      }),
      google.maps.event.addListener(this.marker_, "position_changed", () => {
        this.setPosition()
      }),
      google.maps.event.addListener(this.marker_, "zindex_changed", () => {
        this.setZIndex()
      }),
      google.maps.event.addListener(this.marker_, "visible_changed", () => {
        this.setVisible()
      }),
      google.maps.event.addListener(this.marker_, "labelvisible_changed", () => {
        this.setVisible()
      }),
      google.maps.event.addListener(this.marker_, "title_changed", () => {
        this.setTitle()
      }),
      google.maps.event.addListener(this.marker_, "labelcontent_changed", () => {
        this.setContent()
      }),
      google.maps.event.addListener(this.marker_, "labelanchor_changed", () => {
        this.setAnchor()
      }),
      google.maps.event.addListener(this.marker_, "labelclass_changed", () => {
        this.setStyles()
      }),
      google.maps.event.addListener(this.marker_, "labelstyle_changed", () => {
        this.setStyles()
      })
    ]
  }
  }


  /**
   * Draws the label on the map.
   * @private
   */
  draw(): void {
    this.setContent()
    this.setTitle()
    this.setStyles()
  }

  /**
   * Sets the content of the label.
   * The content can be plain text or an HTML DOM node.
   * @private
   */
  setContent() {
    let content = this.marker_.get("labelContent")

    if (typeof content.nodeType === "undefined") {
      this.labelDiv_.innerHTML = content
      this.eventDiv_.innerHTML = this.labelDiv_.innerHTML
    } else {
      // Remove current content
      while (this.labelDiv_.lastChild) {
        this.labelDiv_.removeChild(this.labelDiv_.lastChild)
      }

      while (this.eventDiv_.lastChild) {
        this.eventDiv_.removeChild(this.eventDiv_.lastChild)
      }

      this.labelDiv_.appendChild(content)
      content = content.cloneNode(true)
      this.eventDiv_.appendChild(content)
    }
  }

  /**
   * Sets the content of the tool tip for the label. It is
   * always set to be the same as for the marker itself.
   * @private
   */
  setTitle() {
    this.eventDiv_.title = this.marker_.getTitle() || ""
  }

  /**
   * Sets the style of the label by setting the style sheet and applying
   * other specific styles requested.
   * @private
   */
  setStyles() {
    // Apply style values from the style sheet defined in the labelClass parameter:
    this.labelDiv_.className = this.marker_.get("labelClass")
    this.eventDiv_.className = this.labelDiv_.className

    // Clear existing inline style values:
    this.labelDiv_.style.cssText = ""
    this.eventDiv_.style.cssText = ""
    // Apply style values defined in the labelStyle parameter:
    const labelStyle: Record<string, string> = this.marker_.get("labelStyle")

    for (let prop in labelStyle) {
      if (labelStyle.hasOwnProperty(prop)) {
        // @ts-ignore
        this.labelDiv_.style[prop] = labelStyle[prop]
        // @ts-ignore
        this.eventDiv_.style[prop] = labelStyle[prop]
      }
    }

    this.setMandatoryStyles()
  }

  /**
   * Sets the mandatory styles to the DIV representing the label as well as to the
   * associated event DIV. This includes setting the DIV position, z-index, and visibility.
   * @private
   */
  setMandatoryStyles() {
    this.labelDiv_.style.position = "absolute"
    this.labelDiv_.style.overflow = "hidden"

    // Make sure the opacity setting causes the desired effect on MSIE:
    if (typeof this.labelDiv_.style.opacity !== "undefined" && this.labelDiv_.style.opacity !== "") {
      // this.labelDiv_.style.MsFilter = "\"progid:DXImageTransform.Microsoft.Alpha(opacity=" + (100 * parseInt(this.labelDiv_.style.opacity, 10)) + ")\""
      this.labelDiv_.style.filter = "alpha(opacity=" + (parseInt(this.labelDiv_.style.opacity, 10) * 100) + ")"
    }

    this.eventDiv_.style.position = this.labelDiv_.style.position
    this.eventDiv_.style.overflow = this.labelDiv_.style.overflow

    this.eventDiv_.style.opacity = "0.01" // Don't use 0; DIV won't be clickable on MSIE
    // this.eventDiv_.style.MsFilter = "\"progid:DXImageTransform.Microsoft.Alpha(opacity=1)\""
    this.eventDiv_.style.filter = "alpha(opacity=1)" // For MSIE

    this.setAnchor()
    this.setPosition() // This also updates z-index, if necessary.
    this.setVisible()
  }

  /**
   * Sets the anchor point of the label.
   * @private
   */
  setAnchor() {
    const anchor = this.marker_.get("labelAnchor")

    this.labelDiv_.style.marginLeft = -anchor.x + "px"
    this.labelDiv_.style.marginTop = -anchor.y + "px"
    this.eventDiv_.style.marginLeft = -anchor.x + "px"
    this.eventDiv_.style.marginTop = -anchor.y + "px"
  }

  /**
   * Sets the position of the label. The z-index is also updated, if necessary.
   * @private
   */
  setPosition(yOffset: number = 0) {
    const position = this.marker_.getPosition()

    if (typeof position !== 'undefined' && position !== null) {
      const point = this.getProjection().fromLatLngToDivPixel(position)

      this.labelDiv_.style.left = Math.round(point.x) + "px"
      this.labelDiv_.style.top = Math.round(point.y - yOffset) + "px"

      this.eventDiv_.style.left = this.labelDiv_.style.left
      this.eventDiv_.style.top = this.labelDiv_.style.top

      this.setZIndex()
    }
  }

  /**
   * Sets the z-index of the label. If the marker's z-index property has not been defined, the z-index
   * of the label is set to the vertical coordinate of the label. This is in keeping with the default
   * stacking order for Google Maps: markers to the south are in front of markers to the north.
   * @private
   */
  setZIndex() {
    const zAdjust = (this.marker_.get("labelInBackground") ? -1 : +1)

    const zIndex =  this.marker_.getZIndex()

    if (typeof zIndex === "undefined" || zIndex === null) {
      this.labelDiv_.style.zIndex = (parseInt(this.labelDiv_.style.top, 10) + zAdjust) + ''
      this.eventDiv_.style.zIndex = this.labelDiv_.style.zIndex
    } else {
      this.labelDiv_.style.zIndex = (zIndex + zAdjust) + ''
      this.eventDiv_.style.zIndex = this.labelDiv_.style.zIndex
    }
  }

  /**
   * Sets the visibility of the label. The label is visible only if the marker itself is
   * visible (i.e., its visible property is true) and the labelVisible property is true.
   * @private
   */
  setVisible() {
    if (this.marker_.get("labelVisible")) {
      this.labelDiv_.style.display = this.marker_.getVisible() ? "block" : "none"
    } else {
      this.labelDiv_.style.display = "none"
    }

    this.eventDiv_.style.display = this.labelDiv_.style.display
  }

  setMap(map: google.maps.Map) {
    this.marker_.setMap(map)
  }
}

export interface MarkerWithLabelOptions {
  labelContent?: string | HTMLElement
  labelAnchor: google.maps.Point
  labelClass: string
  labelStyle: Record<string, string>
  labelInBackground: boolean
  labelVisible?: boolean
  raiseOnDrag?: boolean
  optimized: boolean
  crossImage: string
  handCursor: string
  clickable: boolean
  draggable: boolean
}

/**
 * @name MarkerWithLabelOptions
 * @class This class represents the optional parameter passed to the {@link MarkerWithLabel} constructor.
 *  The properties available are the same as for <code>google.maps.Marker</code> with the addition
 *  of the properties listed below. To change any of these additional properties after the labeled
 *  marker has been created, call <code>google.maps.Marker.set(propertyName, propertyValue)</code>.
 *  <p>
 *  When any of these properties changes, a property changed event is fired. The names of these
 *  events are derived from the name of the property and are of the form <code>propertyname_changed</code>.
 *  For example, if the content of the label changes, a <code>labelcontent_changed</code> event
 *  is fired.
 *  <p>
 * @property {string|Node} [labelContent] The content of the label (plain text or an HTML DOM node).
 * @property {Point} [labelAnchor] By default, a label is drawn with its anchor point at (0,0) so
 *  that its top left corner is positioned at the anchor point of the associated marker. Use this
 *  property to change the anchor point of the label. For example, to center a 50px-wide label
 *  beneath a marker, specify a <code>labelAnchor</code> of <code>google.maps.Point(25, 0)</code>.
 *  (Note: x-values increase to the right and y-values increase to the top.)
 * @property {string} [labelClass] The name of the CSS class defining the styles for the label.
 *  Note that style values for <code>position</code>, <code>overflow</code>, <code>top</code>,
 *  <code>left</code>, <code>zIndex</code>, <code>display</code>, <code>marginLeft</code>, and
 *  <code>marginTop</code> are ignored; these styles are for internal use only.
 * @property {Object} [labelStyle] An object literal whose properties define specific CSS
 *  style values to be applied to the label. Style values defined here override those that may
 *  be defined in the <code>labelClass</code> style sheet. If this property is changed after the
 *  label has been created, all previously set styles (except those defined in the style sheet)
 *  are removed from the label before the new style values are applied.
 *  Note that style values for <code>position</code>, <code>overflow</code>, <code>top</code>,
 *  <code>left</code>, <code>zIndex</code>, <code>display</code>, <code>marginLeft</code>, and
 *  <code>marginTop</code> are ignored; these styles are for internal use only.
 * @property {boolean} [labelInBackground] A flag indicating whether a label that overlaps its
 *  associated marker should appear in the background (i.e., in a plane below the marker).
 *  The default is <code>false</code>, which causes the label to appear in the foreground.
 * @property {boolean} [labelVisible] A flag indicating whether the label is to be visible.
 *  The default is <code>true</code>. Note that even if <code>labelVisible</code> is
 *  <code>true</code>, the label will <i>not</i> be visible unless the associated marker is also
 *  visible (i.e., unless the marker's <code>visible</code> property is <code>true</code>).
 * @property {boolean} [raiseOnDrag] A flag indicating whether the label and marker are to be
 *  raised when the marker is dragged. The default is <code>true</code>. If a draggable marker is
 *  being created and a version of Google Maps API earlier than V3.3 is being used, this property
 *  must be set to <code>false</code>.
 * @property {boolean} [optimized] A flag indicating whether rendering is to be optimized for the
 *  marker. <b>Important: The optimized rendering technique is not supported by MarkerWithLabel,
 *  so the value of this parameter is always forced to <code>false</code>.
 * @property {string} [crossImage="http://maps.gstatic.com/intl/en_us/mapfiles/drag_cross_67_16.png"]
 *  The URL of the cross image to be displayed while dragging a marker.
 * @property {string} [handCursor="http://maps.gstatic.com/intl/en_us/mapfiles/closedhand_8_8.cur"]
 *  The URL of the cursor to be displayed while dragging a marker.
 */

/**
 * @param {Object} instance The Google Maps API instance (usually `google.maps`)
 * @return {Function} The instantiable MarkerWithLabel class
 */
export function MarkerWithLabel(instance: typeof google.maps) {
  inherits(MarkerLabel, instance.OverlayView)

  /**
   * Creates a MarkerWithLabel with the options specified in {@link MarkerWithLabelOptions}.
   * @constructor
   * @param {MarkerWithLabelOptions} [opt_options] The optional parameters.
   */

  class MarkerWithLabel extends google.maps.Marker {
    label: MarkerLabel
    labelContent: string | HTMLElement
    labelAnchor: google.maps.Point
    labelClass: string
    labelStyle: Record<string, string>
    labelInBackground: boolean
    labelVisible:boolean
    raiseOnDrag: boolean

    constructor({
      labelContent = '',
      labelAnchor =  new instance.Point(0, 0),
      labelClass = 'markerLabels',
      labelStyle = {},
      labelInBackground = false,
      labelVisible = true,
      raiseOnDrag = true,
      clickable = true,
      draggable = false,
      crossImage = document.location.protocol + "://maps.gstatic.com/intl/en_us/mapfiles/drag_cross_67_16.png",
      handCursor = document.location.protocol + "://maps.gstatic.com/intl/en_us/mapfiles/closedhand_8_8.cur",
      optimized = false, // Optimized rendering is not supported
    }: MarkerWithLabelOptions) {
      // Call the parent constructor. It calls Marker.setValues to initialize, so all
      // the new parameters are conveniently saved and can be accessed with get/set.
      // Marker.set triggers a property changed event (called "propertyname_changed")
      // that the marker label listens for in order to react to state changes.
      const options: google.maps.ReadonlyMarkerOptions = {
        clickable,
        draggable,
        optimized,
      }

      super(options)

      this.label = new MarkerLabel(this, crossImage, handCursor); // Bind the label to the marker

      this.labelContent = labelContent
      this.labelAnchor = labelAnchor
      this.labelClass = labelClass
      this.labelStyle = labelStyle
      this.labelInBackground = labelInBackground
      this.labelVisible = labelVisible
      this.raiseOnDrag = raiseOnDrag

      instance.Marker.apply(this, [options]);
    }

    /**
   * Overrides the standard Marker setMap function.
   * @param {Map} map The map to which the marker is to be added.
   * @private
   */
  setMap(map: google.maps.Map) {
    // Call the inherited function...
    instance.Marker.prototype.setMap.apply(this, [map]);

    // ... then deal with the label:
    this.label.setMap(map);
  };
  }



  inherits(MarkerWithLabel, instance.Marker);

  return MarkerWithLabel;
}
