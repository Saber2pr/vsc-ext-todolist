import { Button, Dropdown, Menu, message } from 'antd'
import React from 'react'

import MoreOutlined from '@ant-design/icons/MoreOutlined'
import { callService } from '@saber2pr/vscode-webview'

import { KEY_TODO_TREE } from '../../../../src/constants'
import { i18n } from '../../i18n'
import { cloneTree, TreeNode } from '../../utils'

import type { Services } from '../../../../src/api/type'
export interface OptionsBtnProps {
  onCopy: () => TreeNode
  onPaste: (node: TreeNode) => void
}

export const OptionsBtn: React.FC<OptionsBtnProps> = ({ onCopy, onPaste }) => {
  const menu = (
    <Menu>
      <Menu.Item
        onClick={async () => {
          const node = onCopy()
          await callService<Services, 'SetTemp'>('SetTemp', {
            key: KEY_TODO_TREE,
            value: JSON.parse(JSON.stringify(node)),
          })
          message.success(i18n.format('copy_success'))
        }}
      >
        {i18n.format('copy')}
      </Menu.Item>
      <Menu.Item
        onClick={async () => {
          const node: TreeNode = await callService<Services, 'GetTemp'>(
            'GetTemp',
            {
              key: KEY_TODO_TREE,
            }
          )
          node.key = Date.now()
          onPaste(cloneTree(node))
        }}
      >
        {i18n.format('paste')}
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown trigger={['click']} overlay={menu}>
      <Button size="small" type="text" icon={<MoreOutlined />}></Button>
    </Dropdown>
  )
}
