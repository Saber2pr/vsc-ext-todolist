import './style.less'

import React, { CSSProperties, useEffect, useState } from 'react'

import useInterval from 'react-use/lib/useInterval'

export interface WordsInputing {
  inputs: string
  next?: Function
  speed?: number
  interval?: number
  cursor?: boolean
  style?: CSSProperties
  fontSize?: number
}

export const DEFAULT_PLAYFONTSIZE = 24

export const WordsInputing = ({
  inputs,
  next,
  speed = 100,
  interval = 3000,
  cursor = true,
  style,
  fontSize = DEFAULT_PLAYFONTSIZE,
}: WordsInputing) => {
  const [text, setText] = useState('')

  useInterval(
    () => {
      if (text.length < inputs.length) {
        setText(text + inputs[text.length])
      }
    },
    text.length < inputs.length ? speed : null,
  )

  useEffect(() => {
    if (text.length === inputs.length) {
      if (next) {
        next()
      } else {
        setTimeout(() => setText(''), interval)
      }
    }
  }, [text])

  useEffect(() => {
    setText('')
  }, [inputs])

  return (
    <span
      className="WordsInputing"
      style={{
        ...(style || {}),
        fontSize: `${fontSize}px`,
        lineHeight: `${fontSize * 1.5}px`,
      }}
    >
      {text}
      {cursor && (
        <span className="cursor" style={{ height: `${fontSize}px` }} />
      )}
    </span>
  )
}
