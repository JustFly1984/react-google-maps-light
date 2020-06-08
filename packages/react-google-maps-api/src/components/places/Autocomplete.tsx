import * as React from 'react'
import invariant from 'invariant'

import MapContext from '../../map-context'
import {
  unregisterEvents,
  applyUpdatersToPropsAndRegisterEvents,
} from '../../utils/helper'
import { usePrevious } from '../../utils/use-previous'

const eventMap = {
  onPlaceChanged: 'place_changed',
}

const updaterMap = {
  bounds(
    instance: google.maps.places.Autocomplete,
    bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral
  ): void {
    instance.setBounds(bounds)
  },
  restrictions(
    instance: google.maps.places.Autocomplete,
    restrictions: google.maps.places.ComponentRestrictions
  ): void {
    instance.setComponentRestrictions(restrictions)
  },
  fields(instance: google.maps.places.Autocomplete, fields: string[]): void {
    instance.setFields(fields)
  },
  options(
    instance: google.maps.places.Autocomplete,
    options: google.maps.places.AutocompleteOptions
  ): void {
    instance.setOptions(options)
  },
  types(instance: google.maps.places.Autocomplete, types: string[]): void {
    instance.setTypes(types)
  },
}

export interface AutocompleteProps {
  // required
  children: React.ReactChild
  /** The area in which to search for places. */
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral
  /** The component restrictions. Component restrictions are used to restrict predictions to only those within the parent component. For example, the country. */
  restrictions?: google.maps.places.ComponentRestrictions
  /** Fields to be included for the Place in the details response when the details are successfully retrieved. For a list of fields see PlaceResult. Nested fields can be specified with dot-paths (for example, "geometry.location"). */
  fields?: string[]
  options?: google.maps.places.AutocompleteOptions
  /** The types of predictions to be returned. For a list of supported types, see the developer's guide. If nothing is specified, all types are returned. In general only a single type is allowed. The exception is that you can safely mix the 'geocode' and 'establishment' types, but note that this will have the same effect as specifying no types. */
  types?: string[]
  /** This event is fired when a PlaceResult is made available for a Place the user has selected. If the user enters the name of a Place that was not suggested by the control and presses the Enter key, or if a Place Details request fails, the PlaceResult contains the user input in the name property, with no other properties defined. */
  onPlaceChanged?: () => void
  /** This callback is called when the autocomplete instance has loaded. It is called with the autocomplete instance. */
  onLoad?: (autocomplete: google.maps.places.Autocomplete) => void
  /** This callback is called when the component unmounts. It is called with the autocomplete instance. */
  onUnmount?: (autocomplete: google.maps.places.Autocomplete) => void
}

function Autocomplete(props: AutocompleteProps): JSX.Element {
  const { children, options, onLoad, onUnmount } = props
  const map = React.useContext(MapContext)
  const prevProps: AutocompleteProps = usePrevious<AutocompleteProps>(props)
  const containerElementRef = React.useRef<HTMLDivElement | null>(null)

  const [
    instance,
    setInstance,
  ] = React.useState<google.maps.places.Autocomplete | null>(null)

  React.useEffect(
    function effect() {
      invariant(
        !!google.maps.places,
        'You need to provide libraries={["places"]} prop to <LoadScript /> component %s',
        google.maps.places
      )

      if (containerElementRef.current !== null) {
        const input = containerElementRef.current.querySelector('input')

        if (input) {
          const autocomplete = new google.maps.places.Autocomplete(
            input,
            options
          )

          setInstance(autocomplete)

          if (onLoad) {
            onLoad(autocomplete)
          }
        }
      }

      return function cleanup() {
        if (instance !== null) {
          if (onUnmount) {
            onUnmount(instance)
          }
        }
      }
    },
    [instance, map, options, onLoad, onUnmount]
  )

  React.useEffect(
    function effect(): () => void {
      const registeredEvents: google.maps.MapsEventListener[] = applyUpdatersToPropsAndRegisterEvents(
        {
          updaterMap,
          eventMap,
          prevProps,
          nextProps: props,
          instance,
        }
      )

      return function cleanup(): void {
        unregisterEvents(registeredEvents)
      }
    },
    [props, instance, prevProps]
  )

  return <div ref={containerElementRef}>{React.Children.only(children)}</div>
}

export default React.memo(Autocomplete)
