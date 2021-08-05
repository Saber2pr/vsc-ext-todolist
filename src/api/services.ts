import * as vscode from 'vscode'

import { createServiceHandler } from '@saber2pr/vscode-webview'

import { configStore } from '../store/index'
import { Services } from './type'

const handleServiceMessage = createServiceHandler<Services>({
  GetStore: configStore.get,
  Store: ({ key, value }) => {
    configStore.set(key, value)
    return configStore.path
  },
  RefreshStore: () => configStore.refresh(),
  GetLanguage: () => vscode.env.language,
})

export { handleServiceMessage }
