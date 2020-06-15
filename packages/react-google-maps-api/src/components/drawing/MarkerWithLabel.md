# MarkerWithLabel example

```jsx
const { GoogleMap, LoadScript } = require("../../");
const ScriptLoaded = require("../../docs/ScriptLoaded").default;

const mapContainerStyle = {
  height: "400px",
  width: "800px"
}

const center = {
  lat: 0,
  lng: -180
}

const position = {
  lat: 37.772,
  lng: -122.214
}
const labelStyle = {
  textAlign: "center",
  width: "auto",
  backgroundColor: "purple",
  fontSize: "14px",
  borderRadius: '3px',
  color: '#fff',
  transform: "translateX(-50%) translateY(-50%)",
  padding: '5px'
}
const icon= { 
  size: { width: 1, height: 1 },           
  url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2Pg9VD6DwACVAF3tB1M7gAAAABJRU5ErkJggg=='
}

const onLoad = marker => {
  console.log('marker: ', marker)
}

<ScriptLoaded>
  <GoogleMap
    id="marker-example"
    mapContainerStyle={mapContainerStyle}
    zoom={2}
    center={center}
  >
    <MarkerWithLabel
      labelStyle={labelStyle}
      icon={icon}
      labelClass="my-custom-class"
      labelAnchor={{ y: 0 }}
      onLoad={onLoad}
      position={position}
    ><span>Custom Marker</span></MarkerWithLabel>
  </GoogleMap>
</ScriptLoaded>
```
