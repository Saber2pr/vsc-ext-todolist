import { AxiosRequestConfig } from 'axios'

import { Pair } from '@saber2pr/vscode-webview'

// service type define
export type Services = {
  Proxy: Pair<AxiosRequestConfig, any>
  Store: Pair<
    {
      key: string
      value: any
    },
    string
  >
  GetStore: Pair<string, any>
  RefreshStore: Pair<any, any>
  GetLanguage: Pair<any, any>
}

export type ITodoItem = {
  id: number
  content: string
  done: boolean
  level: 'secondary' | 'default' | 'success' | 'warning' | 'danger'
  pendingDelete?: boolean
}

export type ITodoTree = {
  key: string | number,
  children: ITodoTree[],
  todo: ITodoItem
}

export type Key = string | number

export type IStoreTodoTree = {
  tree: ITodoTree[]
  expandKeys: Key[]
}