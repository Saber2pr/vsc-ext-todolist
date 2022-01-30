import { Pair } from '@saber2pr/vscode-webview'

// service type define
export type Services = {
  Store: Pair<
    {
      key: string
      value: any
      path?: string
    },
    string
  >
  GetStore: Pair<{ key: string; path?: string }, any>
  GetLanguage: Pair<any, any>
  SaveFile: Pair<{ path: string; content: string }, any>
  // temp
  SetTemp: Pair<{ key: string; value: any }, any>
  GetTemp: Pair<{ key: string }, any>
}

export type ITodoItem = {
  id: number
  content: string
  done: boolean
  level: 'secondary' | 'default' | 'success' | 'warning' | 'danger'
  pendingDelete?: boolean
}

export type ITodoTree = {
  key: string | number
  children: ITodoTree[]
  todo: ITodoItem
}

export type Key = string | number

export type IStoreTodoTree = {
  tree: ITodoTree[]
  expandKeys: Key[]
  schema: 'https://github.com/Saber2pr/vsc-ext-todolist/blob/master/src/api/type.ts#L26'
  add_mode: 'top' | 'bottom'
}
