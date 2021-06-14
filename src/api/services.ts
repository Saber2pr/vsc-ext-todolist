import axios from 'axios'
import * as vscode from 'vscode'

import { createServiceHandler } from '@saber2pr/vscode-webview'

import { configStore } from '../store/index'
import { Services } from './type'

const request = axios.create({})

const handleServiceMessage = createServiceHandler<Services>({
  Proxy: config => request(config).then(res => res.data),
  GetStore: configStore.get,
  Store: ({ key, value }) => {
    configStore.set(key, value)
    return configStore.path
  },
  GetLanguage: () => vscode.env.language,
})

export { request, handleServiceMessage }
