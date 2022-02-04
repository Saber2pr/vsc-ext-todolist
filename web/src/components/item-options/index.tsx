import Button from 'antd/lib/button'
import Dropdown from 'antd/lib/dropdown'
import Menu from 'antd/lib/menu'
import message from 'antd/lib/message'
import React from 'react'

import MoreOutlined from '@ant-design/icons/MoreOutlined'
import { callService } from '@saber2pr/vscode-webview'

import { KEY_TODO_TREE } from '../../../../src/constants'
import { i18n } from '../../i18n'
import { cloneTree, getArray, TreeNode } from '../../utils'
import { usePromptModal } from '../prompt-modal'

import type { Services } from '../../../../src/api/type'
export interface OptionsBtnProps {
  node: TreeNode
  onPaste: (tree: TreeNode[]) => void
  onAddLink: (link: string) => void
  onExpandAll: (node: TreeNode) => void
  onCollapseAll: (node: TreeNode) => void
}

export const ItemOptions: React.FC<OptionsBtnProps> = ({
  onPaste,
  onAddLink,
  node,
  onCollapseAll,
  onExpandAll,
}) => {
  const { modal, setVisible } = usePromptModal({
    onOk: onAddLink,
    placeholder: i18n.format('add_link_holder'),
    title: i18n.format('add_link'),
    value: node?.todo?.link,
  })
  const menu = (
    <Menu>
      <Menu.Item onClick={() => onCollapseAll(node)}>
        {i18n.format('collapseAll')}
      </Menu.Item>
      <Menu.Item onClick={() => onExpandAll(node)}>
        {i18n.format('expandAll')}
      </Menu.Item>
      <Menu.Item
        onClick={async () => {
          await callService<Services, 'SetTemp'>('SetTemp', {
            key: KEY_TODO_TREE,
            value: JSON.parse(JSON.stringify([node])),
          })
          message.success(i18n.format('copy_success'))
        }}
      >
        {i18n.format('copy')}
      </Menu.Item>
      <Menu.Item
        onClick={async () => {
          const tree: TreeNode[] = await callService<Services, 'GetTemp'>(
            'GetTemp',
            {
              key: KEY_TODO_TREE,
            }
          )
          onPaste(cloneTree(getArray(tree)))
        }}
      >
        {i18n.format('paste')}
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setVisible(true)
        }}
      >
        {i18n.format('add_link')}
      </Menu.Item>
      {modal}
    </Menu>
  )

  return (
    <Dropdown trigger={['click']} overlay={menu}>
      <Button size="small" type="text" icon={<MoreOutlined />}></Button>
    </Dropdown>
  )
}
