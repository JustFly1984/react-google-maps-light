# Google Map example

```jsx
const { LoadScript } = require("./LoadScript");
const ScriptLoaded = require("./docs/ScriptLoaded").default;

const mapContainerStyle = {
  height: "400px",
  width: "800px"
};

const center = {
  lat: -3.745,
  lng: -38.523
};

<ScriptLoaded>
  <GoogleMap
    id="circle-example"
    mapContainerStyle={mapContainerStyle}
    zoom={7}
    center={center}
  />
</ScriptLoaded>;
```

## Map instance

To access map instance (eg. to pan the map imperatively), you can utilize the `onLoad` prop of GoogleMap component.

The GoogleMap component uses React Context internally to pass the map instance around. For the convenience the value is exposed with hook `useGoogleMap` (**_requires React 16.8+_**).

```js static
import React from 'react'
import { useGoogleMap } from '@react-google-maps/api'

function PanningComponent() {
  const map = useGoogleMap()

  React.useEffect(() => {
    if (map) {
      map.panTo(...)
    }
  }, [map])

  return null
}
```
