import * as React from 'react'
import invariant from 'invariant'

import { injectScript as inject } from './utils/injectscript'
import { preventGoogleFonts } from './utils/prevent-google-fonts'

import { isBrowser } from './utils/isbrowser'
import {
  LoadScriptUrlOptions,
  makeLoadScriptUrl,
} from './utils/make-load-script-url'
import { usePrevious } from './utils/use-previous'

let cleaningUp = false

export interface LoadScriptProps extends LoadScriptUrlOptions {
  children: React.ReactNode
  id: string
  loadingElement?: React.ReactNode
  onLoad?: () => void
  onError?: (error: Error) => void
  onUnmount?: () => void
  preventGoogleFontsLoading?: boolean
}

export function DefaultLoadingElement(): JSX.Element {
  return <div>Loading...</div>
}

export const defaultLoadScriptProps = {
  id: 'script-loader',
  version: 'weekly',
}

function LoadScript(props: LoadScriptProps): JSX.Element {
  const {
    googleMapsApiKey,
    googleMapsClientId,
    children,
    id = 'script-loader',
    version = 'weekly',
    language,
    region,
    channel,
    libraries,
    loadingElement,
    onLoad,
    onUnmount,
    onError,
    preventGoogleFontsLoading,
  } = props
  const prevProps: LoadScriptProps = usePrevious<LoadScriptProps>(props)
  const [loaded, setLoaded] = React.useState(false)
  const check = React.useRef<HTMLDivElement | null>(null)

  const injectScript = React.useCallback(
    function callback(): void {
      if (preventGoogleFontsLoading) {
        preventGoogleFonts()
      }

      invariant(!!id, 'LoadScript requires "id" prop to be a string: %s', id)

      const injectScriptOptions = {
        id: id,
        url: makeLoadScriptUrl({
          googleMapsApiKey,
          googleMapsClientId,
          version,
          language,
          region,
          libraries,
          channel,
        }),
      }

      inject(injectScriptOptions)
        .then(function onfulfilled(): void {
          if (onLoad) {
            onLoad()
          }

          setLoaded(true)

          return
        })
        .catch(function onrejected(err): void {
          if (onError) {
            onError(err)
          }

          console.error(`
          There has been an Error with loading Google Maps API script, please check that you provided correct google API key (${googleMapsApiKey ||
            '-'}) or Client ID (${googleMapsClientId || '-'}) to <LoadScript />
          Otherwise it is a Network issue.
        `)
        })
    },
    [
      googleMapsApiKey,
      id,
      version,
      language,
      region,
      channel,
      libraries,
      googleMapsClientId,
      preventGoogleFontsLoading,
      onError,
      onLoad,
    ]
  )

  const isCleaningUp = React.useCallback(async function callback(): Promise<
    void
  > {
    function promiseCallback(resolve: () => void): void {
      if (!cleaningUp) {
        resolve()
      } else {
        if (isBrowser) {
          const timer = window.setInterval(function interval() {
            if (!cleaningUp) {
              window.clearInterval(timer)

              resolve()
            }
          }, 1)
        }
      }

      return
    }

    return new Promise(promiseCallback)
  },
  [])

  const cleanup = React.useCallback(
    function callback(): void {
      cleaningUp = true
      const script = document.getElementById(id)

      if (script && script.parentNode) {
        script.parentNode.removeChild(script)
      }

      Array.prototype.slice
        .call(document.getElementsByTagName('script'))
        .filter(function filter(script: HTMLScriptElement): boolean {
          return (
            typeof script.src === 'string' &&
            script.src.includes('maps.googleapis')
          )
        })
        .forEach(function forEach(script: HTMLScriptElement): void {
          if (script.parentNode) {
            script.parentNode.removeChild(script)
          }
        })

      Array.prototype.slice
        .call(document.getElementsByTagName('link'))
        .filter(function filter(link: HTMLLinkElement): boolean {
          return (
            link.href ===
            'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Google+Sans'
          )
        })
        .forEach(function forEach(link: HTMLLinkElement) {
          if (link.parentNode) {
            link.parentNode.removeChild(link)
          }
        })

      Array.prototype.slice
        .call(document.getElementsByTagName('style'))
        .filter(function filter(style: HTMLStyleElement): boolean {
          return (
            style.innerText !== undefined &&
            style.innerText.length > 0 &&
            style.innerText.includes('.gm-')
          )
        })
        .forEach(function forEach(style: HTMLStyleElement) {
          if (style.parentNode) {
            style.parentNode.removeChild(style)
          }
        })
    },
    [id]
  )

  React.useEffect(
    function effect(): () => void {
      if (isBrowser) {
        if (window.google && !cleaningUp) {
          console.error('google api is already presented')

          return function cleanup(): void {
            return
          }
        }

        isCleaningUp()
          .then(injectScript)
          .catch(function onrejected(err: Error) {
            console.error('Error at injecting script after cleaning up: ', err)
          })
      }

      return function callback(): void {
        if (isBrowser) {
          cleanup()

          const timeoutCallback = (): void => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            if (check.current === null) {
              delete window.google
              cleaningUp = false
            }
          }

          window.setTimeout(timeoutCallback, 1)

          if (onUnmount) {
            onUnmount()
          }
        }
      }
    },
    [cleanup, isCleaningUp, onUnmount, injectScript]
  )

  React.useEffect(
    function effect() {
      if (libraries !== prevProps.libraries) {
        console.warn(
          'Performance warning! LoadScript has been reloaded unintentionally! You should not pass `libraries` prop as new array. Please keep an array of libraries as static class property for Components and PureComponents, or just a const variable outside of component, or somewhere in config files or ENV variables'
        )
      }

      if (isBrowser && prevProps.language !== language) {
        cleanup()

        setLoaded(false)

        delete window.google

        injectScript()
      }
    },
    [
      cleanup,
      injectScript,
      language,
      libraries,
      prevProps.language,
      prevProps.libraries,
    ]
  )

  return (
    <>
      <div ref={check} />

      {loaded ? children : loadingElement || <DefaultLoadingElement />}
    </>
  )
}

export default React.memo(LoadScript)
