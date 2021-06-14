import './style.less'

import Typography from 'antd/lib/typography'
import React from 'react'

import { ITodoItem } from '../../../../src/api/type'

const { Paragraph } = Typography

export interface TodoItem extends ITodoItem {
  onEditEnd(value: string): void
}

export const TodoItem = ({
  done,
  content,
  onEditEnd: onChange,
  level,
}: TodoItem) => {
  return (
    <Paragraph
      delete={done}
      type={level === 'default' ? null : level}
      disabled={done ? true : false}
      editable={
        done
          ? false
          : {
              tooltip: false,
              onChange,
            }
      }
    >
      {content}
    </Paragraph>
  )
}
