import { globalState } from '@/state'
import Typography from 'antd/lib/typography'
import React, { useState } from 'react'

import type { ITodoItem } from '../../../../src/api/type'
const { Text } = Typography

export interface TodoItemProps {
  todo: ITodoItem
  onChange: VoidFunction
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onChange }) => {
  const [editing, setEditing] = useState(false)
  return (
    <Text
      delete={todo.done}
      type={todo.level === 'default' ? null : todo.level}
      disabled={todo.done ? true : false}
      editable={
        todo.done
          ? false
          : {
              tooltip: false,
              editing: editing,
              onStart() {
                setEditing(true)
                globalState.blockKeyboard = true
              },
              onEnd() {
                setEditing(false)
                globalState.blockKeyboard = false
              },
              onCancel() {
                setEditing(false)
                globalState.blockKeyboard = false
              },
              onChange: (value) => {
                globalState.blockKeyboard = false
                if (todo.content !== value) {
                  todo.content = value
                  onChange()
                } else {
                  setEditing(false)
                }
              },
            }
      }
    >
      {editing ? (
        todo.content
      ) : todo.link ? (
        <a href={todo.link}>{todo.content}</a>
      ) : (
        todo.content
      )}
    </Text>
  )
}
