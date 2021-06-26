import { ITodoItem, ITodoTree } from './type'

export const calcProgress = (todos: ITodoItem[]) => {
  const length = todos?.length
  if (length) {
    const doneLength = todos.reduce(
      (acc, item) => (item.done ? acc + 1 : acc),
      0
    )
    return Number(Number((doneLength * 100) / length).toFixed(0))
  } else {
    return 0
  }
}

export const calcProgressV2 = (todos: ITodoTree[]) => {
  let sum = 0
  let doneNum = 0
  while (todos.length) {
    const current = todos.pop()
    if(current.children){
      todos.push(...current.children)
    }
    sum++
    if(current.todo.done){
      doneNum++
    }
  }
  if(sum === 0){
    return 0
  }
  return Number(Number((doneNum * 100) / sum).toFixed(0))
}
