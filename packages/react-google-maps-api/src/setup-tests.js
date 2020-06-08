const createMockFuncsFromArray = (instance, names = []) => {
  names.forEach(name => {
    instance[name] = jest.fn().mockName(name)
  })
}

const createGoogleMapsMock = (libraries = []) => {
  const createMVCObject = instance => {
    const listeners = {}
    instance.listeners = listeners

    instance.addListener = jest
      .fn((event, fn) => {
        listeners[event] = listeners[event] || []
        listeners[event].push(fn)
        return {
          remove: () => {
            const index = listeners[event].indexOf(fn)

            if (index !== -1) {
              listeners[event].splice(index, 1)
            }
          },
        }
      })
      .mockName('addListener')

    createMockFuncsFromArray(instance, [
      'bindTo',
      'get',
      'notify',
      'set',
      'setValues',
      'unbind',
      'unbindAll',
    ])
  }

  const maps = {
    Animation: {
      BOUNCE: 1,
      DROP: 2,
      Lo: 3,
      Go: 4,
    },
    BicyclingLayer: jest.fn().mockImplementation(function BicyclingLayer() {
      createMVCObject(this)
      createMockFuncsFromArray(this, ['setMap'])
    }),
    TransitLayer: jest.fn().mockImplementation(function TransitLayer() {
      createMVCObject(this)
      createMockFuncsFromArray(this, ['setMap'])
    }),
    Circle: jest.fn().mockImplementation(function Circle(opts) {
      this.opts = opts
      createMVCObject(this)
      createMockFuncsFromArray(this, [
        'setCenter',
        'setDraggable',
        'setEditable',
        'setMap',
        'setOptions',
        'setRadius',
        'setVisible',
      ])
    }),
    ControlPosition: {
      TOP_LEFT: 1,
      TOP_CENTER: 2,
      TOP: 2,
      TOP_RIGHT: 3,
      LEFT_CENTER: 4,
      LEFT: 5,
      LEFT_TOP: 5,
      LEFT_BOTTOM: 6,
      RIGHT: 7,
      RIGHT_CENTER: 8,
      RIGHT_BOTTOM: 9,
      BOTTOM_LEFT: 10,
      BOTTOM: 11,
      BOTTOM_CENTER: 11,
      BOTTOM_RIGHT: 12,
      CENTER: 13,
    },
    Data: jest.fn().mockImplementation(function Data(options) {
      this.options = options
      createMVCObject(this)
      createMockFuncsFromArray(this, [
        'setControlPosition',
        'setControls',
        'setDrawingMode',
        'setMap',
        'setStyle',
      ])
    }),
    DirectionsRenderer: jest
      .fn()
      .mockImplementation(function DirectionsRenderer(opts) {
        this.opts = opts
        createMVCObject(this)
        createMockFuncsFromArray(this, [
          'setDirections',
          'setMap',
          'setOptions',
          'setPanel',
          'setRouteIndex',
        ])
      }),
    DirectionsService: function DirectionsService() {
      return
    },
    DirectionsStatus: {
      INVALID_REQUEST: 'INVALID_REQUEST',
      MAX_WAYPOINTS_EXCEEDED: 'MAX_WAYPOINTS_EXCEEDED',
      NOT_FOUND: 'NOT_FOUND',
      OK: 'OK',
      OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
      REQUEST_DENIED: 'REQUEST_DENIED',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR',
      ZERO_RESULTS: 'ZERO_RESULTS',
    },
    DirectionsTravelMode: {
      BICYCLING: 'BICYCLING',
      DRIVING: 'DRIVING',
      TRANSIT: 'TRANSIT',
      WALKING: 'WALKING',
    },
    DirectionsUnitSystem: {
      IMPERIAL: 1,
      METRIC: 0,
    },
    DistanceMatrixElementStatus: {
      NOT_FOUND: 'NOT_FOUND',
      OK: 'OK',
      ZERO_RESULTS: 'ZERO_RESULTS',
    },
    DistanceMatrixService: function DistanceMatrixService() {
      return
    },
    DistanceMatrixStatus: {
      INVALID_REQUEST: 'INVALID_REQUEST',
      MAX_DIMENSIONS_EXCEEDED: 'MAX_DIMENSIONS_EXCEEDED',
      MAX_ELEMENTS_EXCEEDED: 'MAX_ELEMENTS_EXCEEDED',
      OK: 'OK',
      OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
      REQUEST_DENIED: 'REQUEST_DENIED',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    },
    ElevationService: function ElevationService() {
      return
    },
    ElevationStatus: {
      Co: 'DATA_NOT_AVAILABLE',
      INVALID_REQUEST: 'INVALID_REQUEST',
      OK: 'OK',
      OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
      REQUEST_DENIED: 'REQUEST_DENIED',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    },
    FusionTablesLayer: jest
      .fn()
      .mockImplementation(function FusionTablesLayer(options) {
        this.options = options
        createMVCObject(this)
        createMockFuncsFromArray(this, ['setMap', 'setOptions'])
      }),
    Geocoder: function Geocoder() {
      return
    },
    GeocoderLocationType: {
      APPROXIMATE: 'APPROXIMATE',
      GEOMETRIC_CENTER: 'GEOMETRIC_CENTER',
      RANGE_INTERPOLATED: 'RANGE_INTERPOLATED',
      ROOFTOP: 'ROOFTOP',
    },
    GeocoderStatus: {
      ERROR: 'ERROR',
      INVALID_REQUEST: 'INVALID_REQUEST',
      OK: 'OK',
      OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
      REQUEST_DENIED: 'REQUEST_DENIED',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR',
      ZERO_RESULTS: 'ZERO_RESULTS',
    },
    GroundOverlay: function GroundOverlay() {
      return
    },
    ImageMapType: function ImageMapType() {
      return
    },
    InfoWindow: function InfoWindow() {
      return
    },
    KmlLayer: function KmlLayer() {
      return
    },
    KmlLayerStatus: {
      DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
      DOCUMENT_TOO_LARGE: 'DOCUMENT_TOO_LARGE',
      FETCH_ERROR: 'FETCH_ERROR',
      INVALID_DOCUMENT: 'INVALID_DOCUMENT',
      INVALID_REQUEST: 'INVALID_REQUEST',
      LIMITS_EXCEEDED: 'LIMITS_EXCEEDED',
      OK: 'OK',
      TIMED_OUT: 'TIMED_OUT',
      UNKNOWN: 'UNKNOWN',
    },
    LatLng: function LatLng() {
      return
    },
    LatLngBounds: function LatLngBounds() {
      return
    },
    MVCArray: function MVCArray() {
      return
    },
    MVCObject: jest.fn().mockImplementation(function MVCObject() {
      createMVCObject(this)
    }),
    Map: jest.fn().mockImplementation(function Map(mapDiv, opts) {
      this.mapDiv = mapDiv
      this.opts = opts
      createMVCObject(this)
      createMockFuncsFromArray(this, [
        'setCenter',
        'setClickableIcons',
        'setHeading',
        'setMapTypeId',
        'setOptions',
        'setStreetView',
        'setTilt',
        'setZoom',
        'fitBounds',
        'getBounds',
        'panToBounds',
      ])
    }),
    MapTypeControlStyle: {
      DEFAULT: 0,
      DROPDOWN_MENU: 2,
      HORIZONTAL_BAR: 1,
      INSET: 3,
      INSET_LARGE: 4,
    },
    MapTypeId: {
      HYBRID: 'hybrid',
      ROADMAP: 'roadmap',
      SATELLITE: 'satellite',
      TERRAIN: 'terrain',
    },
    MapTypeRegistry: function MapTypeRegistry() {
      return
    },
    Marker: jest.fn().mockImplementation(function Marker(opts) {
      this.opts = opts
      createMVCObject(this)
      createMockFuncsFromArray(this, [
        'setMap',
        'setOpacity',
        'setOptions',
        'setPosition',
        'setShape',
        'setTitle',
        'setVisible',
        'setZIndex',
      ])
    }),
    MarkerImage: function MarkerImage() {
      return
    },
    MaxZoomService: function MaxZoomService() {
      return {
        getMaxZoomAtLatLng: function getMaxZoomAtLatLng() {
          return
        },
      }
    },
    MaxZoomStatus: {
      ERROR: 'ERROR',
      OK: 'OK',
    },
    NavigationControlStyle: {
      ANDROID: 2,
      DEFAULT: 0,
      Mo: 4,
      SMALL: 1,
      ZOOM_PAN: 3,
      ik: 5,
    },
    OverlayView: function OverlayView() {
      return
    },
    Point: function Point() {
      return
    },
    Polygon: function Polygon() {
      return
    },
    Polyline: function Polyline() {
      return
    },
    Rectangle: function Rectangle() {
      return
    },
    SaveWidget: function SaveWidget() {
      return
    },
    ScaleControlStyle: {
      DEFAULT: 0,
    },
    Size: function Size() {
      return
    },
    StreetViewCoverageLayer: function StreetViewCoverageLayer() {
      return
    },
    StreetViewPanorama: function StreetViewPanorama() {
      return
    },
    StreetViewPreference: {
      BEST: 'best',
      NEAREST: 'nearest',
    },
    StreetViewService: function StreetViewService() {
      return
    },
    StreetViewSource: {
      DEFAULT: 'default',
      OUTDOOR: 'outdoor',
    },
    StreetViewStatus: {
      OK: 'OK',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR',
      ZERO_RESULTS: 'ZERO_RESULTS',
    },
    StrokePosition: {
      CENTER: 0,
      INSIDE: 1,
      OUTSIDE: 2,
    },
    StyledMapType: function StyledMapType() {
      return
    },
    SymbolPath: {
      BACKWARD_CLOSED_ARROW: 3,
      BACKWARD_OPEN_ARROW: 4,
      CIRCLE: 0,
      FORWARD_CLOSED_ARROW: 1,
      FORWARD_OPEN_ARROW: 2,
    },
    TrafficLayer: jest.fn().mockImplementation(function TrafficLayer(opts) {
      this.opts = opts
      createMVCObject(this)
      createMockFuncsFromArray(this, ['setMap', 'setOptions'])
    }),
    TrafficModel: {
      BEST_GUESS: 'bestguess',
      OPTIMISTIC: 'optimistic',
      PESSIMISTIC: 'pessimistic',
    },
    TransitMode: {
      BUS: 'BUS',
      RAIL: 'RAIL',
      SUBWAY: 'SUBWAY',
      TRAIN: 'TRAIN',
      TRAM: 'TRAM',
    },
    TransitRoutePreference: {
      FEWER_TRANSFERS: 'FEWER_TRANSFERS',
      LESS_WALKING: 'LESS_WALKING',
    },
    TravelMode: {
      BICYCLING: 'BICYCLING',
      DRIVING: 'DRIVING',
      TRANSIT: 'TRANSIT',
      WALKING: 'WALKING',
    },
    UnitSystem: {
      IMPERIAL: 1,
      METRIC: 0,
    },
    ZoomControlStyle: {
      DEFAULT: 0,
      LARGE: 2,
      SMALL: 1,
      ik: 3,
    },
    __gjsload__: function __gjsload__() {
      return
    },
    event: {
      clearInstanceListeners: jest.fn().mockName('clearInstanceListeners'),
    },
  }

  if (libraries.includes('places')) {
    maps.places = {
      AutocompleteService: jest.fn(() => ({
        getPlacePredictions: jest.fn(),
      })),
    }
  }

  return maps
}

window.google = {
  maps: createGoogleMapsMock(),
}
