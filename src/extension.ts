import { join } from 'path'
import * as vscode from 'vscode'

import { calcProgressV2 } from './api/calc-progress'
import { FILE_CONFIG_PATH, handleServiceMessage } from './api/services'
import { IStoreTodoTree } from './api/type'
import { COM_MAIN, KEY_TODO_TREE } from './constants'
import { RCManager } from './store/rc'
import { TodoEditor } from './TodoEditor'
import {
  createWebviewContent,
  WebviewParams,
} from './webview/createWebviewContent'

let webviewPanel: vscode.WebviewPanel
let statusBar: vscode.StatusBarItem = null

const displayName = 'Todo List'
const loginWelcome = 'Check Todo List.'

const updateStatusBarProgressV2 = async () => {
  const listStr = await new RCManager(FILE_CONFIG_PATH).get(KEY_TODO_TREE)
  if (listStr) {
    const list: IStoreTodoTree = listStr
    const length = list.tree.length
    const percent = calcProgressV2(list.tree)
    statusBar.text = length ? `Todo (${percent}%)` : displayName
  }
}

// install
export function activate(context: vscode.ExtensionContext) {
  // statusBar init
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  )
  statusBar.text = displayName
  statusBar.tooltip = loginWelcome
  statusBar.command = COM_MAIN
  statusBar.show()
  updateStatusBarProgressV2()

  // webview init
  function activeProjectCreatorWebview(params: WebviewParams = {}) {
    if (webviewPanel) {
      webviewPanel.reveal()
    } else {
      webviewPanel = vscode.window.createWebviewPanel(
        displayName,
        displayName,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      )
      webviewPanel.iconPath = vscode.Uri.file(
        join(context.extensionPath, 'assets', 'logo.png')
      )

      webviewPanel.webview.html = createWebviewContent({
        webviewPanel,
        basePath: context.extensionPath,
        params,
      })

      webviewPanel.webview.onDidReceiveMessage(
        async message => {
          await handleServiceMessage(webviewPanel, message)
          await updateStatusBarProgressV2()
        },
        null,
        context.subscriptions
      )

      webviewPanel.onDidDispose(
        () => {
          webviewPanel = undefined
        },
        null,
        context.subscriptions
      )
    }
  }
  // subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand(COM_MAIN, () => {
      activeProjectCreatorWebview()
    }),
    vscode.window.registerCustomEditorProvider(
      'todolist.edit',
      new TodoEditor(context)
    )
  )
  context.subscriptions.push(statusBar)
}

// uninstall
export function deactivate() {
  if (statusBar) {
    statusBar.hide()
    statusBar.dispose()
  }
  if (webviewPanel) {
    webviewPanel.dispose()
  }
  statusBar = null
  webviewPanel = null
}
