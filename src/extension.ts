import { join } from 'path'
import * as vscode from 'vscode'

import { calcProgressV2 } from './api/calc-progress'
import { handleServiceMessage } from './api/services'
import { IStoreTodoTree } from './api/type'
import { COM_MAIN, KEY_TODO_TREE } from './constants'
import { configStore } from './store/index'
import { createWebviewContent } from './webview/createWebviewContent'

let webviewPanel: vscode.WebviewPanel
let statusBar: vscode.StatusBarItem = null

const displayName = 'Todo List'
const loginWelcome = 'Check Todo List.'

// const updateStatusBarProgress = () => {
//   const listStr = configStore.get(KEY_TODO)
//   if (listStr) {
//     const list: ITodoItem[] = JSON.parse(listStr)
//     const percent = calcProgress(list)
//     statusBar.text = list.length ? `Todo (${percent}%)` : displayName
//   }
// }
const updateStatusBarProgressV2 = () => {
  const listStr = configStore.get(KEY_TODO_TREE)
  if (listStr) {
    const list: IStoreTodoTree = JSON.parse(listStr)
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
  // updateStatusBarProgress()
  updateStatusBarProgressV2()

  // webview init
  function activeProjectCreatorWebview() {
    configStore.refresh()
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
      })

      webviewPanel.webview.onDidReceiveMessage(
        message => {
          handleServiceMessage(webviewPanel, message)
          // updateStatusBarProgress()
          updateStatusBarProgressV2()
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
    })
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
