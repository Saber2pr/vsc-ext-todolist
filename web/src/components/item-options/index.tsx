import Button from 'antd/lib/button'
import Dropdown from 'antd/lib/dropdown'
import Menu from 'antd/lib/menu'
import message from 'antd/lib/message'
import { BaseType } from 'antd/lib/typography/Base'
import React from 'react'

import MoreOutlined from '@ant-design/icons/MoreOutlined'
import { callService } from '@saber2pr/vscode-webview'

import { KEY_TODO_TREE } from '../../../../src/constants'
import { i18n } from '../../i18n'
import { TreeNode } from '../../utils'
import { usePromptModal } from '../prompt-modal'

import type { Services } from '../../../../src/api/type'
import { globalState } from '@/state'
export const TodoLevels: Record<BaseType | 'default', number> = {
  danger: 0,
  warning: 1,
  success: 2,
  default: 3,
  secondary: 4,
}

export interface OptionsBtnProps {
  node: TreeNode
  onPaste: (node: TreeNode) => void
  onAddLink: (link: string) => void
  onExpandAll: (node: TreeNode) => void
  onDelete: (node: TreeNode) => void
  onCollapseAll: (node: TreeNode) => void
  menuOnly?: boolean
}

export const copyNode = async (node: TreeNode) => {
  await callService<Services, 'SetTemp'>('SetTemp', {
    key: KEY_TODO_TREE,
    value: JSON.parse(JSON.stringify([node])),
  })
  message.success(i18n.format('copy_success'))
}

export const useCreateItemMenu = ({
  onPaste,
  onAddLink,
  node,
  onCollapseAll,
  onExpandAll,
  onDelete,
}: OptionsBtnProps) => {
  const { modal, setVisible } = usePromptModal({
    onOk: (value) => {
      onAddLink(value)
      globalState.blockKeyboard = false
    },
    placeholder: i18n.format('add_link_holder'),
    title: i18n.format('add_link'),
    value: node?.todo?.link,
    onCancel: () => {
      globalState.blockKeyboard = false
    },
  })

  return (
    <Menu>
      <Menu.Item onClick={() => onCollapseAll(node)}>
        {i18n.format('collapseAll')}
      </Menu.Item>
      <Menu.Item onClick={() => onExpandAll(node)}>
        {i18n.format('expandAll')}
      </Menu.Item>
      <Menu.Item onClick={() => onDelete(node)}>
        {i18n.format('delete')}
      </Menu.Item>
      <Menu.Item onClick={() => copyNode(node)}>
        {i18n.format('copy')}
      </Menu.Item>
      <Menu.Item onClick={() => onPaste(node)}>
        {i18n.format('paste')}
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          globalState.blockKeyboard = true
          setVisible(true)
        }}
      >
        {i18n.format('add_link')}
      </Menu.Item>
      {modal}
    </Menu>
  )
}
export const ItemOptions: React.FC<OptionsBtnProps> = (props) => {
  const menu = useCreateItemMenu(props)
  return (
    <Dropdown trigger={['click']} overlay={menu}>
      <Button size="small" type="text" icon={<MoreOutlined />}></Button>
    </Dropdown>
  )
}
