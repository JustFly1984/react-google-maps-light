export function getOffsetOverride(
  containerElement: HTMLElement,
  getPixelPositionOffset?: (
    offsetWidth: number,
    offsetHeight: number
  ) => { x: number; y: number }
): { x: number; y: number } | Record<string, unknown> {
  return typeof getPixelPositionOffset === 'function'
    ? getPixelPositionOffset(
        containerElement.offsetWidth,
        containerElement.offsetHeight
      )
    : {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createLatLng(inst: any, Type: any): any {
  return new Type(inst.lat, inst.lng)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createLatLngBounds(inst: any, Type: any): any {
  return new Type(
    new google.maps.LatLng(inst.ne.lat, inst.ne.lng),
    new google.maps.LatLng(inst.sw.lat, inst.sw.lng)
  )
}

function ensureOfType(
  inst:
    | google.maps.LatLngBounds
    | google.maps.LatLngBoundsLiteral
    | google.maps.LatLng
    | google.maps.LatLngLiteral,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  factory: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return inst instanceof type ? inst : factory(inst, type)
}

const getLayoutStylesByBounds = (
  mapCanvasProjection: google.maps.MapCanvasProjection,
  offset: { x: number; y: number },
  bounds: google.maps.LatLngBounds
): React.CSSProperties => {
  const ne = mapCanvasProjection.fromLatLngToDivPixel(bounds.getNorthEast())

  const sw = mapCanvasProjection.fromLatLngToDivPixel(bounds.getSouthWest())

  if (ne && sw) {
    return {
      left: `${sw.x + offset.x}px`,
      top: `${ne.y + offset.y}px`,
      width: `${ne.x - sw.x - offset.x}px`,
      height: `${sw.y - ne.y - offset.y}px`,
    }
  }

  return {
    left: '-9999px',
    top: '-9999px',
  }
}

function getLayoutStylesByPosition(
  mapCanvasProjection: google.maps.MapCanvasProjection,
  offset: { x: number; y: number },
  position: google.maps.LatLng
): React.CSSProperties {
  const point = mapCanvasProjection.fromLatLngToDivPixel(position)

  if (point) {
    const { x, y } = point

    return {
      left: `${x + offset.x}px`,
      top: `${y + offset.y}px`,
    }
  }

  return {
    left: '-9999px',
    top: '-9999px',
  }
}

export function getLayoutStyles(
  mapCanvasProjection: google.maps.MapCanvasProjection,
  offset: { x: number; y: number },
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral,
  position?: google.maps.LatLng | google.maps.LatLngLiteral
): React.CSSProperties | null {
  if (bounds !== undefined) {
    return getLayoutStylesByBounds(
      mapCanvasProjection,
      offset,
      ensureOfType(bounds, google.maps.LatLngBounds, createLatLngBounds)
    )
  }

  if (position !== undefined) {
    return getLayoutStylesByPosition(
      mapCanvasProjection,
      offset,
      ensureOfType(position, google.maps.LatLng, createLatLng)
    )
  }

  return null
}
