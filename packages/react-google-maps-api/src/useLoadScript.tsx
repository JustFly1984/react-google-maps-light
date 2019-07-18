/* eslint-disable filenames/match-regex */
import * as React from 'react'
import invariant from 'invariant'

import { isBrowser } from './utils/isbrowser'
import { injectScript } from './utils/injectscript'
import { preventGoogleFonts } from './utils/prevent-google-fonts'
import { makeLoadScriptUrl, LoadScriptUrlOptions } from './utils/make-load-script-url'

import { defaultLoadScriptProps } from './LoadScript'
import { useCallback } from 'react'

export interface UseLoadScriptOptions extends LoadScriptUrlOptions {
  id?: string;
  preventGoogleFontsLoading?: boolean;
}

let previouslyLoadedUrl: string

const useIsMounted = () => {
  const isMountedRef = React.useRef(false)
  React.useEffect(function trackMountedState() {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])
  return useCallback(() => isMountedRef.current,[]);
}

export function useLoadScript({
  id = defaultLoadScriptProps.id,
  version = defaultLoadScriptProps.version,
  googleMapsApiKey,
  googleMapsClientId,
  language,
  region,
  libraries,
  preventGoogleFontsLoading,
}: UseLoadScriptOptions) {
  const isMounted = useIsMounted();
  const [isLoaded, setLoaded] = React.useState(false)
  const [loadError, setLoadError] = React.useState<Error | undefined>(undefined)

  React.useEffect(function applyPreventGoogleFonts() {
    if (isBrowser && preventGoogleFontsLoading) {
      preventGoogleFonts()
    }
  }, [preventGoogleFontsLoading])

  React.useEffect(function validateLoadedState() {
    if (isLoaded) {
      invariant(
        // @ts-ignore
        !!window.google,
        "useLoadScript was marked as loaded, but window.google is not present. Something went wrong."
      )
    }
  }, [isLoaded])

  const url = makeLoadScriptUrl({ version, googleMapsApiKey, googleMapsClientId, language, region, libraries })

  React.useEffect(function loadScriptAndModifyLoadedState() {
    if (!isBrowser) {
      return
    }

    function resetStateIfMounted() {
      if (isMounted()) {
        setLoaded(false)
        setLoadError(undefined)
      }
    }

    function setLoadedIfMounted() {
      if (isMounted()) {
        setLoaded(true)
        previouslyLoadedUrl = url
      }
    }

    if ((window as any).google && previouslyLoadedUrl === url) {
      setLoadedIfMounted()
      return
    }

    resetStateIfMounted();

    injectScript({ id, url })
      .then(setLoadedIfMounted)
      .catch(function handleInjectError(err) {
        if (isMounted()) {
          setLoadError(err)
        }
        console.warn(`
        There has been an Error with loading Google Maps API script, please check that you provided correct google API key (${googleMapsApiKey || '-'}) or Client ID (${googleMapsClientId || '-'})
        Otherwise it is a Network issue.
      `)
        console.error(err)
      })
  }, [id, url])

  const prevLibraries = React.useRef<undefined | string[]>()

  React.useEffect(function checkPerformance() {
    if (prevLibraries.current && libraries !== prevLibraries.current) {
      console.warn(
        'Performance warning! Loadscript has been reloaded unintentionally! You should not pass `libraries` prop as new array. Please keep an array of libraries as static class property for Components and PureComponents, or just a const variable outside of component, or somewhere in config files or ENV variables'
      )
    }
    prevLibraries.current = libraries
  }, [libraries])

  return { isLoaded, loadError, url }
}
