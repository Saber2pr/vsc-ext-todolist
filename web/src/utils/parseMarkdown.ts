import { TreeNode } from './tree'

export interface ParseMarkdownOptions {
  noTab?: boolean
}

const parseMarkdown = (
  tree: TreeNode[],
  opts: ParseMarkdownOptions,
  depth = 0,
  parent: TreeNode = null
): string =>
  tree
    .map(node => {
      const noTab = opts.noTab

      let text = node.todo.content

      let padStart =
        Array(depth * 2)
          .fill(' ')
          .join('') + '- '

      const children = node.children
      let childrenText = children
        ? parseMarkdown(node.children, opts, depth + 1, node)
        : ''

      if (noTab) {
        text = children.length
          ? ''
          : parent
          ? `【${parent.todo.content}】${text}`
          : text
        padStart = ''
        return `${text}${childrenText}`
      }

      /**
       * padStart text
       * childrenText
       */
      return `${padStart}${text}\n` + childrenText
    })
    .join(opts.noTab ? '\n' : '')

export const parseMd = (tree: TreeNode[], noTab = false) => {
  const md = parseMarkdown(tree, { noTab })
  if (noTab) {
    return md
      .split('\n')
      .map((line, i) => `${i + 1}. ${line}`)
      .join('\n')
  }
  return md
}
