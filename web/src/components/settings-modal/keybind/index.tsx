import { Descriptions } from 'antd'
import React from 'react'
import { i18n } from '../../../i18n'

export interface KeybindProps {}

export const Keybind: React.FC<KeybindProps> = ({}) => {
  return (
    <Descriptions bordered column={1}>
      <Descriptions.Item label={i18n.format('newItem')}>Tab</Descriptions.Item>
      <Descriptions.Item label={i18n.format('newItem_sibling')}>
        Enter
      </Descriptions.Item>
      <Descriptions.Item label={i18n.format('delete')}>
        Backspace or Delete
      </Descriptions.Item>
      <Descriptions.Item label={i18n.format('copy')}>
        Ctrl + c or Ctrl + C
      </Descriptions.Item>
      <Descriptions.Item label={i18n.format('paste')}>
        Ctrl + v or Ctrl + V
      </Descriptions.Item>
    </Descriptions>
  )
}
