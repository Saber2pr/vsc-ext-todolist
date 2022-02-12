import Tree from 'antd/lib/tree'
import { DataNode } from 'antd/lib/tree'
import React, { useState } from 'react'

import { OptionsBtnProps } from '../'
import { Key } from '../../../../src/api/type'
import { treeDrop, TreeNode } from '../../utils'

export interface TodoTreeProps {
  virtualMode: boolean
  titleRender: (node: DataNode) => React.ReactNode
  expandedKeys: Key[]
  onExpand: (keys: string[]) => void
  treeData: TreeNode[]
  handleDrop: (newTree: TreeNode[]) => void
  itemOptions: OptionsBtnProps
}

export const TodoTree: React.FC<TodoTreeProps> = ({
  virtualMode,
  titleRender,
  expandedKeys,
  onExpand,
  treeData,
  handleDrop,
  itemOptions,
}) => {
  const [selectedKeys, setSelectedKeys] = useState([])

  return (
    <Tree
      motion={null}
      height={virtualMode ? 500 : undefined}
      titleRender={titleRender}
      expandedKeys={expandedKeys}
      onExpand={onExpand}
      draggable
      blockNode
      onDrop={treeDrop(treeData, handleDrop)}
      treeData={treeData}
      onRightClick={({ node }) => {
        setSelectedKeys([node.key])
      }}
      onSelect={setSelectedKeys}
      selectedKeys={selectedKeys}
    />
  )
}
