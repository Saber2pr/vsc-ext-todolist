import { DataNode } from 'antd/lib/tree'

import { ITodoItem, ITodoTree } from '../../../src/api/type'

export interface TreeNode extends DataNode {
  todo: ITodoItem
  children: TreeNode[]
  toJSON?: () => ITodoTree
}

export const getTreeKeys = (...tree: TreeNode[]) => {
  const keys = []
  mapTree(tree, node => {
    node.key && keys.push(node.key)
    return node
  })
  return keys
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

export const insertNode = (container: TreeNode[], node: TreeNode) => {
  if (Array.isArray(container)) {
    container.unshift(node)
  }
}

export const removeNode = (container: TreeNode[], node: TreeNode) => {
  if (Array.isArray(container)) {
    container.splice(container.indexOf(node), 1)
  }
}
export const clearDoneNode = (
  treeNode: TreeNode[],
  isRemove: (node: TreeNode) => boolean
) => {
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

export interface TreeLike {
  children?: any[]
}

export const mapTree = <N extends TreeLike, T extends TreeLike>(
  treeNode: N[],
  mapFunc: (node: N) => T
) => {
  if (!(treeNode?.length > 0)) return []
  const nextTree: T[] = []
  for (const node of treeNode) {
    const newNode = mapFunc(node)
    newNode.children = mapTree(node.children, mapFunc)
    nextTree.push(newNode)
  }
  return nextTree
}

export const cloneTree = (node: TreeNode) => {
  let i = 0
  const start = Date.now()
  const tree = mapTree([node], n => {
    const newNode = { ...n }
    i++
    newNode.key = start + i
    return newNode
  })
  return tree[0]
}
