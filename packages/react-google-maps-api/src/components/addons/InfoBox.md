# InfoBox example

```jsx
const { GoogleMap, LoadScript, InfoBox } = require("../../");
const ScriptLoaded = require("../../docs/ScriptLoaded").default;

const mapContainerStyle = {
  height: "400px",
  width: "800px"
};

const center = {
  lat: 33.772,
  lng: -117.214
};

const options = { closeBoxURL: '', enableEventPropagation: true };

const onLoad = infoBox => {
  console.log('infoBox: ', infoBox)
};

const styleOuterDiv = { backgroundColor: 'yellow', opacity: 0.75, padding: 12 };
const styleInnerDiv = { fontSize: 16, fontColor: `#08233B` };

<ScriptLoaded>
  <GoogleMap
    id="InfoBox-example"
    mapContainerStyle={mapContainerStyle}
    zoom={10}
    center={center}
  >
    <InfoBox
      onLoad={onLoad}
      options={options}
      position={center}
    >
      <div style={styleOuterDiv}>
        <div style={styleInnerDiv}>
          Hello, World!
        </div>
      </div>
    </InfoBox>
  </GoogleMap>
</ScriptLoaded>
```
