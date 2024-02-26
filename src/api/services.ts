import { COM_MAIN, DATA_CONFIG, VIEW_TYPE } from './../constants'
import { homedir } from 'os'
import { dirname, join, isAbsolute } from 'path'
import * as vscode from 'vscode'

import { createServiceHandler, HandleMap } from '@saber2pr/vscode-webview'

import { FILE_DEFAULT, FILE_TEMP } from '../constants'
import { RCManager } from '../store/rc'
import {
  saveWorkspaceFile,
  saveWorkspaceFileAs,
} from '../utils/saveWorkspaceFile'
import { Services } from './type'
import { updateStatusBarProgressV2 } from '../extension'

export const DATA_CONFIG_PATH = join(homedir(), DATA_CONFIG)
export const DEFAULT_FILE_PATH = join(homedir(), FILE_DEFAULT)
export const FILE_TEMP_PATH = join(homedir(), FILE_TEMP)

export const ServicesHandlers: HandleMap<Services, keyof Services> = {
  GetStore: async ({ key, path = DEFAULT_FILE_PATH }) => {
    const rc = new RCManager(path)
    const result = (await rc.get(key)) || {}
    result.lang = vscode.env.language
    return result
  },
  Store: async ({ key, value, path = DEFAULT_FILE_PATH }) => {
    const rc = new RCManager(path)
    await rc.set(key, value)
    return path
  },
  SaveFile: ({ path, content, title }) =>
    saveWorkspaceFile(title, path, content),
  SaveFileAs: ({ name, content, title }) =>
    saveWorkspaceFileAs(title, name, content),
  SetConfig: async ({ key, value }) => {
    const rc = new RCManager(DATA_CONFIG_PATH)
    await rc.set(key, value)
    return DATA_CONFIG_PATH
  },
  GetConfig: async ({ key }) => {
    const rc = new RCManager(DATA_CONFIG_PATH)
    return rc.get(key)
  },
  GetDefaultFilePath: async () => DEFAULT_FILE_PATH,
  async openFile() {
    const uri = await vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: {
        TodoList: ['.todo', '.todolistrc'],
      },
    })
    return uri?.[0].fsPath
  },
  SetDisplayFile: async file => {
    const rc = new RCManager(DATA_CONFIG_PATH)
    await rc.set('displayFile', file)
    await updateStatusBarProgressV2()
    return DATA_CONFIG_PATH
  },
  GetDisplayFile: async () => {
    const rc = new RCManager(DATA_CONFIG_PATH)
    const path = await rc.get('displayFile')
    return path || DEFAULT_FILE_PATH
  },
  reload: async () => vscode.commands.executeCommand(COM_MAIN, 'true'),
  OpenFile: async ({ path, currentPath }) => {
    const isTodoFile = /.(todo|todolistrc)$/.test(path)
    let openPath = path
    if (currentPath && !isAbsolute(openPath)) {
      const dir = dirname(currentPath)
      openPath = join(dir, openPath)
    }
    await vscode.commands.executeCommand(
      'vscode.openWith',
      vscode.Uri.file(openPath),
      isTodoFile ? VIEW_TYPE : 'default'
    )
  },
  openExternal: url => vscode.env.openExternal(url),
}

const handleServiceMessage = createServiceHandler<Services>(ServicesHandlers)

export { handleServiceMessage }
