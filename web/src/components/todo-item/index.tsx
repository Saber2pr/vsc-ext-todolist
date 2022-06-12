import { globalState } from '@/state'
import { LinkOutlined } from '@ant-design/icons'
import { callService, isInVscode } from '@saber2pr/vscode-webview'
import Typography from 'antd/lib/typography'
import React, { useState } from 'react'

import type { ITodoItem, Services } from '../../../../src/api/type'
const { Text } = Typography

export interface TodoItemProps {
  todo: ITodoItem
  onChange: VoidFunction
}

const LinkIcon = <LinkOutlined style={{ marginLeft: 4 }} />

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onChange }) => {
  const [editing, setEditing] = useState(false)

  let content: string | JSX.Element = todo.content
  if (editing) {
    content = todo.content
  } else {
    if (todo.link) {
      const isUrlLink = /^http/.test(todo.link)
      if (isUrlLink) {
        content = (
          <a href={todo.link}>
            {todo.content}
            {LinkIcon}
          </a>
        )
      } else {
        content = (
          <a
            onClick={() =>
              callService<Services, 'OpenFile'>('OpenFile', {
                path: todo.link,
              })
            }
          >
            {todo.content}
            {LinkIcon}
          </a>
        )
      }
    }
  }

  return (
    <Text
      delete={todo.done}
      type={todo.level === 'default' ? null : todo.level}
      disabled={todo.done ? true : false}
      editable={
        !isInVscode
          ? false
          : todo.done
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
      {content}
    </Text>
  )
}
