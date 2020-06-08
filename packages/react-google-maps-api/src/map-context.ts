import { useContext, createContext } from 'react'
import invariant from 'invariant'

const MapContext = createContext<google.maps.Map | null>(null)

export function useGoogleMap(): google.maps.Map | null {
  invariant(
    !!useContext,
    'useGoogleMap is React hook and requires React version 16.8+'
  )

  const map = useContext(MapContext)

  invariant(!!map, 'useGoogleMap needs a GoogleMap available up in the tree')

  return map
}

export default MapContext
