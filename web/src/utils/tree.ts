import { DataNode } from 'antd/lib/tree'

import { ITodoItem, ITodoTree } from '../../../src/api/type'
import { TodoLevels } from '../components'

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
  const stack = Array.isArray(treeNode) ? treeNode.slice() : []
  while (stack.length) {
    const node = stack.pop()
    if (node.key === key) return node
    stack.push(...node.children)
  }
}

export const appendNodes = (container: TreeNode[], ...node: TreeNode[]) => {
  if (Array.isArray(container)) {
    container.push(...node)
  }
}

export const insertNodes = (container: TreeNode[], ...node: TreeNode[]) => {
  if (Array.isArray(container)) {
    container.unshift(...node)
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

export const cloneTree = (tree: TreeNode[]) => {
  let i = 0
  const start = Date.now()
  return mapTree(tree, n => {
    const newNode = { ...n }
    i++
    newNode.key = start + i
    return newNode
  })
}

export const sortTree = (treeNode: TreeNode[]) => {
  if (!(treeNode?.length > 0)) return []
  const nextTree: TreeNode[] = []

  // sort
  const treeNodeSorted = treeNode.slice().sort((a, b) => {
    const todoA = a?.todo
    const todoB = b?.todo
    if (todoA && todoB) {
      const aVal = TodoLevels[todoA.level] ?? 0
      const bVal = TodoLevels[todoB.level] ?? 0
      return aVal - bVal
    }
    return 0
  })

  // split
  const newTreeNodeProcess: TreeNode[] = []
  const newTreeNodeDone: TreeNode[] = []
  for (const node of treeNodeSorted) {
    if (node?.todo?.done) {
      newTreeNodeDone.push(node)
    } else {
      newTreeNodeProcess.push(node)
    }
  }

  // concat
  const newTree = newTreeNodeProcess.concat(newTreeNodeDone)
  for (const node of newTree) {
    const newNode = { ...node }
    newNode.children = sortTree(newNode.children)
    nextTree.push(newNode)
  }
  return nextTree
}
