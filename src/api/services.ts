import { saveWorkspaceFile } from './../utils/saveWorkspaceFile'
import { homedir } from 'os'
import { join } from 'path'
import * as vscode from 'vscode'

import { createServiceHandler } from '@saber2pr/vscode-webview'

import { FILE_CONFIG } from '../constants'
import { RCManager } from '../store/rc'
import { Services } from './type'

export const FILE_CONFIG_PATH = join(homedir(), FILE_CONFIG)

const handleServiceMessage = createServiceHandler<Services>({
  GetStore: ({ key, path = FILE_CONFIG_PATH }) => {
    const rc = new RCManager(path)
    return rc.get(key)
  },
  Store: async ({ key, value, path = FILE_CONFIG_PATH }) => {
    const rc = new RCManager(path)
    await rc.set(key, value)
    return path
  },
  GetLanguage: () => vscode.env.language,
  SaveFile: ({ path, content }) => saveWorkspaceFile(path, content),
})

export { handleServiceMessage }
