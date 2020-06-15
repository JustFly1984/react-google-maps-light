declare module 'markerwithlabel' {
  import Point = google.maps.Point;

  interface MarkerWithLabelOptions extends google.maps.MarkerOptions {
    labelAnchor?: Point
    labelClass?: string
    labelStyle?: React.CSSProperties
    labelVisible?: boolean
  }

  class MarkerWithLabel extends google.maps.Marker {
   constructor(args: MarkerWithLabelOptions);
  }

  function factory (maps: {}): typeof MarkerWithLabel
  export = factory
}

