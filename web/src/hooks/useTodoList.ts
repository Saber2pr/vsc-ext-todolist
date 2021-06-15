import { useEffect, useRef, useState } from 'react'

import { callService } from '@saber2pr/vscode-webview'

import { ITodoItem, Services } from '../../../src/api/type'
import { KEY_TODO } from '../../../src/constants'
import { IdList } from '../utils'
import { getArray } from '../utils/getArray'

export const useTodoList = (): [
  ITodoItem[],
  (refresh?: boolean) => Promise<void>,
  IdList<ITodoItem>
] => {
  const ref = useRef<IdList<ITodoItem>>()
  const [todos, setTodos] = useState<ITodoItem[]>()

  const updateTodo = async (refresh = false) => {
    const todo = ref.current
    if (refresh) {
      await callService<Services, 'RefreshStore'>('RefreshStore', null)
    }
    if (todo && !refresh) {
      await callService<Services, 'Store'>('Store', {
        key: KEY_TODO,
        value: todo.toString(),
      })
    } else {
      const data = await callService<Services, 'GetStore'>('GetStore', KEY_TODO)
      ref.current = new IdList(data ? JSON.parse(data) : null)
    }
    return ref.current
  }

  const updateList = async (refresh = false) => {
    const todo = await updateTodo(refresh)
    setTodos([...getArray(todo?.list)])
  }

  useEffect(() => {
    updateList()
  }, [])

  return [todos, updateList, ref.current]
}
