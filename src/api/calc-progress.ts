import type { ITodoTree } from './type'

export const calcProgressV2 = (todos: ITodoTree[]) => {
  let sum = 0
  let doneNum = 0
  const stack: ITodoTree[] = [...todos]
  while (stack.length) {
    const current = stack.pop()
    if (current.children) {
      stack.push(...current.children)
    }
    sum++
    if (current.todo.done) {
      doneNum++
    }
  }
  if (sum === 0) {
    return 0
  }
  return Number(Number((doneNum * 100) / sum).toFixed(0))
}
