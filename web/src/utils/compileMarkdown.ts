import { i18n } from '../i18n'
import { TreeNode } from './tree'

export interface ParseMarkdownOptions {
  noTab?: boolean
  displayDone?: boolean
  displayLink?: boolean
}

const compileMarkdown = (
  tree: TreeNode[],
  opts: ParseMarkdownOptions,
  depth = 0,
  parent: TreeNode = null
): string =>
  tree
    .map(node => {
      const noTab = opts.noTab
      const displayDone = opts.displayDone
      const displayLink = opts.displayLink

      let text = node.todo.content
      let done = node.todo.done

      if (displayLink) {
        const link = node.todo.link
        if (link) {
          text = `[${text}](${link})`
        }
      }

      let padStart =
        Array(depth * 2)
          .fill(' ')
          .join('') + '- '

      if (displayDone) {
        padStart += `[${done ? 'x' : ' '}] `
      }

      const children = node.children
      let childrenText = children
        ? compileMarkdown(node.children, opts, depth + 1, node)
        : ''

      if (noTab) {
        let doneDisplay = ''
        if (displayDone) {
          doneDisplay = done
            ? i18n.format('md_bracket_done_ok')
            : i18n.format('md_bracket_done_no')
          doneDisplay = ' - ' + doneDisplay
        }

        text = children.length
          ? ''
          : parent
          ? `${i18n.format('md_bracket_left')}${
              parent.todo.content
            }${i18n.format('md_bracket_right')}${i18n.format(
              'md_bracket_right_space'
            )}${text}${doneDisplay}`
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

export const compileMd = (tree: TreeNode[], opts: ParseMarkdownOptions) => {
  const { noTab, displayDone, displayLink } = opts ?? {}
  const md = compileMarkdown(tree, { noTab, displayDone, displayLink })
  if (noTab) {
    return md
      .split('\n')
      .map((line, i) => `${i + 1}. ${line}`)
      .join('\n')
  }
  return md
}
