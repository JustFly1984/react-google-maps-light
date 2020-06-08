import * as React from 'react'
import * as storage from './docs-api-key'

import LoadScript from '../LoadScript'

const libraries = ['drawing', 'places', 'visualization']

const inputStyle = {
  width: '400px',
  height: '40px',
  paddingLeft: '8px',
}

const buttonStyle = {
  height: '40px',
  marginLeft: '8px',
}

const loadingElement: JSX.Element = <div>Loading...</div>

interface DocsApiKeyInputProps {
  children: React.ReactChild
}

function DocsApiKeyInput({ children }: DocsApiKeyInputProps): JSX.Element {
  const [key, setKey] = React.useState<string | null>(null)
  const [inputKey, setInputKey] = React.useState('')

  React.useEffect(
    function effect() {
      const k = key === null ? storage.getKey() : inputKey

      if (k !== null) {
        storage.setKey(k)
      }
    },
    [key, inputKey]
  )

  const onInputChange = React.useCallback(function callback({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>): void {
    setInputKey(value)
  },
  [])

  const onFormSubmit = React.useCallback(
    function callback(event: React.FormEvent<HTMLFormElement>): void {
      event.preventDefault()

      if (inputKey === '') {
        setKey(null)
        storage.removeKey()
      }

      setKey(inputKey)
      storage.setKey(inputKey)
    },
    [inputKey]
  )

  return (
    <>
      <form onSubmit={onFormSubmit}>
        <input
          type='text'
          onChange={onInputChange}
          value={inputKey}
          placeholder='Enter Google Maps API Key'
          style={inputStyle}
        />

        <button type='submit' style={buttonStyle}>
          Set Key
        </button>
      </form>

      {key !== null ? (
        <LoadScript
          id='script-loader'
          googleMapsApiKey={key}
          language='en'
          region='EN'
          version='weekly'
          libraries={libraries}
          loadingElement={loadingElement}
        >
          {children}
        </LoadScript>
      ) : (
        <></>
      )}
    </>
  )
}

export default React.memo(DocsApiKeyInput)
