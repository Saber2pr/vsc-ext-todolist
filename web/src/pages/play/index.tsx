import {
  DEFAULT_PLAYFONTSIZE,
  WordsInputing,
} from '@/components/words-inputing'
import { useAsync } from '@/hooks/useAsync'
import { countTreeSize, getArray, parseUrlParam, TreeNode } from '@/utils'
import { callService } from '@saber2pr/vscode-webview'
import { Spin } from 'antd'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import type {
  IStoreTodoTree,
  ITodoTree,
  Services,
} from '../../../../src/api/type'
import { KEY_TODO_TREE } from '../../../../src/constants'
import { Container } from './index.style'
import nprogress from 'nprogress'
import keycode from 'keycode'

export interface PagePlayProps {}

export const PagePlay: React.FC<PagePlayProps> = ({}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = location?.search ? parseUrlParam(location.search) : {}

  const { data, loading } = useAsync(async () => {
    const todo = await callService<Services, 'GetStore'>('GetStore', {
      key: KEY_TODO_TREE,
      path: params?.file,
    })
    const val: IStoreTodoTree = todo
    return val
  })

  const [node, setNode] = useState<TreeNode>(null)

  const max = useMemo(() => countTreeSize(getArray(data?.tree).slice()), [data])

  const stackRef = useRef<ITodoTree[]>(null)
  const stepRef = useRef<number>(0)
  useEffect(() => {
    stackRef.current = getArray(getArray(data?.tree).slice())
  }, [data])

  const next = () => {
    const stack = stackRef.current
    if (stack.length) {
      const progress = stepRef.current / max
      stepRef.current = stepRef.current + 1
      nprogress.set(progress)
      const item = stack.shift()
      setNode(item)
      stack.unshift(...item.children)
      stackRef.current = stack
    } else {
      nprogress.done()
      navigate(-1)
    }
  }

  const msg = node?.todo?.content || params?.name

  useEffect(() => {
    const onKeydownHandle = (event: KeyboardEvent) => {
      const code = keycode(event)
      if (['space', 'enter', 'right', 'down'].includes(code)) {
        next()
      }
    }
    document.addEventListener('keydown', onKeydownHandle)
    return () => document.removeEventListener('keydown', onKeydownHandle)
  }, [max])

  return (
    <Spin spinning={loading}>
      <Container onClick={() => next()}>
        {msg && (
          <WordsInputing
            fontSize={data?.playFontSize || DEFAULT_PLAYFONTSIZE}
            inputs={msg}
            key={msg}
            next={() => {}}
          />
        )}
      </Container>
    </Spin>
  )
}
