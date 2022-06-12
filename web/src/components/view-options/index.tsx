import { Button, Dropdown, Menu, message } from 'antd'
import React from 'react'

import MoreOutlined from '@ant-design/icons/MoreOutlined'
import { callService } from '@saber2pr/vscode-webview'

import { Services } from '../../../../src/api/type'
import { KEY_TODO_TREE } from '../../../../src/constants'
import { i18n } from '../../i18n'
import { cloneTree, getArray, TreeNode } from '../../utils'

export interface ViewOptionsProps {
  tree: TreeNode[]
  onUpdate: VoidFunction
  onExpandAll: VoidFunction
  onCollapseAll: VoidFunction
  onPaste: (tree: TreeNode[]) => any
  onSort: VoidFunction
}

export const ViewOptions: React.FC<ViewOptionsProps> = ({
  onCollapseAll,
  onExpandAll,
  onUpdate,
  onPaste,
  onSort,
  tree,
}) => {
  const menu = (
    <Menu>
      <Menu.Item onClick={onUpdate}>{i18n.format('update')}</Menu.Item>
      <Menu.Item onClick={onCollapseAll}>
        {i18n.format('collapseAll')}
      </Menu.Item>
      <Menu.Item onClick={onExpandAll}>{i18n.format('expandAll')}</Menu.Item>
      <Menu.Item
        onClick={async () => {
          await callService<Services, 'SetTemp'>('SetTemp', {
            key: KEY_TODO_TREE,
            value: JSON.parse(JSON.stringify(getArray(tree))),
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
            },
          )
          onPaste(cloneTree(getArray(tree)))
        }}
      >
        {i18n.format('paste')}
      </Menu.Item>
      <Menu.Item onClick={onSort}>{i18n.format('sort')}</Menu.Item>
    </Menu>
  )

  return (
    <Dropdown placement="topCenter" trigger={['click']} overlay={menu}>
      <Button type="text">
        {i18n.format('viewOps')}
        <MoreOutlined />
      </Button>
    </Dropdown>
  )
}
