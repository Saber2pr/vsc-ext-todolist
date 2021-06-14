import { ITodoItem } from './type'

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
