import * as React from 'react'

interface ScriptLoadedProps {
  // eslint-disable-next-line @typescript-eslint/ban-types
  children: React.ReactChild | React.ReactChildren | Function
}

function SpanIntro(): JSX.Element {
  return (
    <span>
      <a href='#section-introduction'>Enter API Key</a> to see examples
    </span>
  )
}

const SpanIntroMemo = React.memo(SpanIntro)

function ScriptLoaded(props: ScriptLoadedProps): JSX.Element {
  const { children } = props
  const [scriptLoaded, setScriptLoaded] = React.useState(!!window.google)
  const [intervalState, setIntervalState] = React.useState(0)

  const checkIfScriptLoaded = React.useCallback(function callback(): void {
    if (window.google) {
      setScriptLoaded(true)
      window.clearInterval(intervalState)
    }
  }, [])

  React.useEffect(
    function effect() {
      setIntervalState(window.setInterval(checkIfScriptLoaded, 200))

      return function callback() {
        window.clearInterval(intervalState)
      }
    },
    [checkIfScriptLoaded, intervalState]
  )

  if (!scriptLoaded) {
    return <SpanIntroMemo />
  }

  return children instanceof Function ? children() : children
}

export default React.memo(ScriptLoaded)
