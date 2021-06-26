import { DataNode } from 'antd/lib/tree'

import { ITodoItem, ITodoTree } from '../../../src/api/type'

export interface TreeNode extends DataNode {
  todo: ITodoItem
  children: TreeNode[]
  toJSON?: () => ITodoTree
}

export const findNode = (treeNode: TreeNode[], key: number): TreeNode => {
  if (!(treeNode?.length > 0)) return
  for (const node of treeNode) {
    if (node.key === key) return node
    return findNode(node.children, key)
  }
}

export const appendNode = (container: TreeNode[], node: TreeNode) => {
  if (Array.isArray(container)) {
    container.push(node)
  }
}
export const removeNode = (container: TreeNode[], node: TreeNode) => {
  if (Array.isArray(container)) {
    container.splice(container.indexOf(node), 1)
  }
}
export const clearDoneNode = (treeNode: TreeNode[], isRemove: (node: TreeNode) => boolean) => {
  if (!(treeNode?.length > 0)) return []
  const nextTree: TreeNode[] = []
  for (const node of treeNode) {
    if (isRemove(node)) {
      continue
    }
    nextTree.push(node)
    node.children = clearDoneNode(node.children, isRemove)
  }
  return nextTree
}
