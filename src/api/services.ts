import { homedir } from 'os'
import { join } from 'path'
import * as vscode from 'vscode'

import { createServiceHandler } from '@saber2pr/vscode-webview'

import { FILE_CONFIG, FILE_TEMP } from '../constants'
import { RCManager } from '../store/rc'
import {
  saveWorkspaceFile,
  saveWorkspaceFileAs,
} from '../utils/saveWorkspaceFile'
import { Services } from './type'

export const FILE_CONFIG_PATH = join(homedir(), FILE_CONFIG)
export const FILE_TEMP_PATH = join(homedir(), FILE_TEMP)

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
  SaveFileAs: ({ name, content }) => saveWorkspaceFileAs(name, content),
  GetTemp: ({ key }) => {
    const rc = new RCManager(FILE_TEMP_PATH)
    return rc.get(key)
  },
  SetTemp: async ({ key, value }) => {
    const rc = new RCManager(FILE_TEMP_PATH)
    await rc.set(key, value)
    return FILE_TEMP_PATH
  },
})

export { handleServiceMessage }
